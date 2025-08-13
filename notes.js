let currentNoteId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    
    document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    document.getElementById('deleteNoteBtn').addEventListener('click', deleteNote);
});

async function loadNotes() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const notesRef = firebase.firestore().collection('users').doc(user.uid).collection('notes');
    const snapshot = await notesRef.get();
    
    const notesList = document.querySelector('.notes-list');
    notesList.innerHTML = '';
    
    snapshot.forEach(doc => {
        const note = doc.data();
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = note.title;
        noteElement.addEventListener('click', () => loadNote(doc.id, note));
        notesList.appendChild(noteElement);
    });
}

function createNewNote() {
    currentNoteId = null;
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('editorContainer').classList.remove('hidden');
}

function loadNote(id, note) {
    currentNoteId = id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('editorContainer').classList.remove('hidden');
}

async function saveNote() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    const noteData = { title, content, updatedAt: new Date() };
    
    try {
        const notesRef = firebase.firestore().collection('users').doc(user.uid).collection('notes');
        
        if (currentNoteId) {
            await notesRef.doc(currentNoteId).update(noteData);
        } else {
            await notesRef.add(noteData);
        }
        
        loadNotes();
    } catch (error) {
        console.error('Error saving note:', error);
    }
}

async function deleteNote() {
    if (!currentNoteId) return;
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        await firebase.firestore().collection('users').doc(user.uid)
            .collection('notes').doc(currentNoteId).delete();
        
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('editorContainer').classList.add('hidden');
        loadNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}