// 1. Configuració de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCoanvjKXdambR642sFqMDDwyCEVlHiavg",
    authDomain: "todo-netlify-ddd5a.firebaseapp.com",
    projectId: "todo-netlify-ddd5a",
    storageBucket: "todo-netlify-ddd5a.firebasestorage.app",
    messagingSenderId: "662552452656",
    appId: "1:662552452656:web:45a507b7ff25fed113d7f5",
    measurementId: "G-NGP4D8F44M"
};

// 2. Inicialitzar Firebase (Estil Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referència a la col·lecció (com el teu 'tasquesRef')
const missatgesRef = db.collection("muro_mensajes");

// Referències al DOM HTML
const nombreInput = document.getElementById("nombreInput");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");
const contenedor = document.getElementById("contenedor-mensajes");

// ---------------------------------------------------------
// FUNCIÓ 1: CREAR (add)
// ---------------------------------------------------------
enviarBtn.addEventListener("click", () => {
    const nombre = nombreInput.value;
    const mensaje = mensajeInput.value;

    if (!nombre || !mensaje) return alert("Omple els camps!");

    // Ús de .add() com demanaves
    missatgesRef.add({
        autor: nombre,
        texto: mensaje,
        likes: 0, // Camp nou per poder fer update després
        fecha: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            mensajeInput.value = ""; // Netejar camp
            console.log("Missatge enviat correctament!");
        })
        .catch((error) => {
            console.error("Error al crear:", error);
        });
});

// ---------------------------------------------------------
// FUNCIÓ 2: LLEGIR EN TEMPS REAL (onSnapshot)
// ---------------------------------------------------------
// Ordenem per data descendent i escoltem canvis
missatgesRef.orderBy("fecha", "desc").onSnapshot((snapshot) => {
    contenedor.innerHTML = ""; // Netejar pantalla

    snapshot.forEach((doc) => {
        const id = doc.id;        // ID del document
        const data = doc.data();  // Dades (autor, texto, likes...)

        pintarMissatge(id, data);
    });

    if (snapshot.empty) {
        contenedor.innerHTML = "<p>No hi ha missatges encara.</p>";
    }
});

// Funció per generar l'HTML de cada missatge
function pintarMissatge(id, data) {
    const div = document.createElement("div");
    div.classList.add("mensaje-card");

    // Construim l'HTML
    div.innerHTML = `
        <div class="mensaje-header">
            <span class="autor">${data.autor}</span>
            <span>Likes: ${data.likes || 0}</span>
        </div>
        <p class="texto-mensaje">${data.texto}</p>
        
        <div class="acciones">
            <button class="btn-accion btn-like" onclick="ferLike('${id}', ${data.likes || 0})">
                ♥ M'agrada (Update)
            </button>
            
            <button class="btn-accion btn-delete" onclick="esborrarMissatge('${id}')">
                🗑 Esborrar (Delete)
            </button>
        </div>
    `;

    contenedor.appendChild(div);
}

// ---------------------------------------------------------
// FUNCIÓ 3: ACTUALITZAR (update)
// ---------------------------------------------------------
// Aquesta funció es crida des del botó "M'agrada"
window.ferLike = function (id, likesActuals) {
    // Accedir a un document concret i actualitzar
    missatgesRef.doc(id).update({
        likes: likesActuals + 1
    })
        .then(() => console.log("Like sumat!"))
        .catch((err) => console.error("Error al fer update:", err));
};

// ---------------------------------------------------------
// FUNCIÓ 4: ESBORRAR (delete)
// ---------------------------------------------------------
// Aquesta funció es crida des del botó "Esborrar"
window.esborrarMissatge = function (id) {
    if (confirm("Segur que vols esborrar aquest missatge?")) {
        // Accedir a un document concret i esborrar
        missatgesRef.doc(id).delete()
            .then(() => console.log("Missatge eliminat!"))
            .catch((err) => console.error("Error al fer delete:", err));
    }
};