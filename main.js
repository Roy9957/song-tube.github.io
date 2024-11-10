import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUC_HgTh9IizQPXpQ2aDZky1lQ-q5fCVg",
  authDomain: "chat-app-77dc9.firebaseapp.com",
  databaseURL: "https://chat-app-77dc9-default-rtdb.firebaseio.com",
  projectId: "chat-app-77dc9",
  storageBucket: "chat-app-77dc9.appspot.com",
  messagingSenderId: "495275933066",
  appId: "1:495275933066:web:3ccbb6397bfb474c451c73",
  measurementId: "G-RW69T49GDH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Navigation section switching


document.getElementById("loginNav").addEventListener("click", () => showSection("loginSection"));

document.getElementById("getNav").addEventListener("click", () => showSection("setSection"));
  
document.getElementById("profileNav").addEventListener("click", () => showSection("profileSection"));
document.getElementById("watchNav").addEventListener("click", () => {
  showSection("watchSection");
  displayUploadedAudios();
  
  
  
  
  // Fix function name here
});
document.getElementById("uploadNav").addEventListener("click", () => showSection("uploadSection"));

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(section => section.style.display = "none");
  document.getElementById(sectionId).style.display = "block";
}

// Switch between Login and Sign Up
const authForm = document.getElementById("authForm");
const toggleLink = document.getElementById("toggleLink");
let isLoginMode = true;

toggleLink.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  document.getElementById("submitBtn").textContent = isLoginMode ? "LOGIN" : "SIGN UP";
  toggleLink.textContent = isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login";
});

// Handle Login and Sign Up form submission
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      alert("Verification email sent! Please check your inbox.");
    }
  } catch (error) {
    document.getElementById("errorMessage").textContent = error.message;
  }
});

// Check if user is logged in or not
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = `Wellcome→ ${user.email}😃`;
    showSection("profileSection");
  } else {
    showSection("loginSection");
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  showSection("loginSection");
});

// Audio upload functionality
document.getElementById("uploadAudioBtn").addEventListener("click", async () => {
  const title = document.getElementById("audioTitle").value;
  const file = document.getElementById("audioFile").files[0];
  if (!file) return alert("Please select an audio file to upload.");

  const audioRef = storageRef(storage, `audio/${file.name}`);
  await uploadBytes(audioRef, file);
  const downloadURL = await getDownloadURL(audioRef);

  // Save audio under a common 'audios' node
  await set(ref(database, `audios/${title}`), { title, url: downloadURL, userId: auth.currentUser.uid });
  alert("Audio uploaded successfully!");
});

// Display uploaded audios with embedded player
async function displayUploadedAudios() {
  const snapshot = await get(child(ref(database), `audios`)); // Fix `audio` to `audios`
  const audioList = document.getElementById("audioList");
  audioList.innerHTML = "";
  
  if (snapshot.exists()) {
    const audios = snapshot.val();
    for (const title in audios) {
      const audioItem = document.createElement("div");
      audioItem.className = "audio-item";
      audioItem.innerHTML = `
        <h3>${audios[title].title}</h3>
        <audio controls>
          <source src="${audios[title].url}" type="audio/mp3">
          Your browser does not support the audio tag.
        </audio>
      `;
      audioList.appendChild(audioItem);
    }
  } else {
    audioList.innerHTML = "<p>No audios uploaded yet.</p>";
  }
}