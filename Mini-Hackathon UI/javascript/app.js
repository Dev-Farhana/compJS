import {
	auth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	signOut,
	doc,
	setDoc,
	db,
	getDoc,
	updateDoc,
} from './firebaseConfig.js';

let flag = true;

let getuser = async (uid) => {
	showLoader();
	console.log('Start Karein', uid);
	const docRef = doc(db, 'UsersSignUp', uid);
	const docSnap = await getDoc(docRef);
	let fullName = document.getElementById('fullName');
	let email = document.getElementById('email');
	let password = document.getElementById('password');
	let userUid = document.getElementById('uid');

	if (docSnap.exists()) {
		console.log('Document data:', docSnap.data());
		if (location.pathname === '/profile.html') {
			fullName.value = docSnap.data().fullName;
			email.value = docSnap.data().email;
			password.value = docSnap.data().Password;
			userUid.value = uid;
			console.log(uid);
			hideLoader();
		} else {
			let fullName = document.getElementById('fullName');
			fullName.innerHTML = docSnap.data().fullName;
		}
		hideLoader();
	} else {
		// docSnap.data() will be undefined in this case
		console.log('No such document!');
		hideLoader();
	}
};

function handleSubmission() {
	const titleInput = document.getElementById("title");
	const contentInput = document.getElementById("content");
	const dashboard = document.getElementById("dashboardPreview");
	const imgInput = document.getElementById("image");
  
	const title = titleInput.value;
	const content = contentInput.value;
	const imageFile = imgInput.files[0];
  
	if (title && content) {
	  saveToLocalStorage(title, content, imageFile);
	  titleInput.value = "";
	  contentInput.value = "";
	  imgInput.value = "";
	  loadFromLocalStorage(dashboard);
	}
}
  
function saveToLocalStorage(title, content, imageFile) {
	const existingPosts = JSON.parse(localStorage.getItem("blogPosts")) || [];
	
	const blogPost = { title, content, image: null };
  
	if (imageFile) {
	  const reader = new FileReader();
	  reader.onload = (event) => {
		blogPost.image = event.target.result;
		existingPosts.push(blogPost);
		localStorage.setItem("blogPosts", JSON.stringify(existingPosts));
		loadFromLocalStorage(dashboard); // Reload after the image is saved
	  };
	  reader.readAsDataURL(imageFile);
	} else {
	  existingPosts.push(blogPost);
	  localStorage.setItem("blogPosts", JSON.stringify(existingPosts));
	  loadFromLocalStorage(dashboard); // Reload without image if no image is selected
	}
}
  
function loadFromLocalStorage(dashboard) {
	dashboard.innerHTML = '';
	const existingPosts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  
	existingPosts.forEach(post => {
	  const postContainer = document.createElement("div");
	  postContainer.classList.add("blog-post");
	  if(post.image){
		const imageElement =document.createElement('img');
		imageElement.classList.add('blog-image');
		imageElement.src = post.image;
		postContainer.appendChild(imageElement);
	  }
  
	  const titleElement = document.createElement("h2");
	  titleElement.classList.add("blog-title");
	  titleElement.textContent = post.title;
  
	  const contentElement = document.createElement("p");
	  contentElement.classList.add("blog-content");
	  contentElement.textContent = post.content;
  
	  postContainer.appendChild(titleElement);
	  postContainer.appendChild(contentElement);
  
	  dashboard.appendChild(postContainer);
	});
}
  
  // Attach the handleSubmission function to the submit button click event
  const submitButton = document.getElementById("submitPost");
  submitButton.addEventListener("click", handleSubmission);
  
  // Load and display blog posts from local storage when the page loads
  window.addEventListener("load", () => {
	const dashboard = document.getElementById("dashboardPreview");
	loadFromLocalStorage(dashboard);
  });

//  Check user is logged in or not
	onAuthStateChanged(auth, (user) => {
	if (user) {
		getuser(user.uid);
		// const uid = user.uid;
		console.log(user);
		console.log("Auth is checking status!!");
		console.log("pathName:",location.pathname);
		if (location.pathname !== '/blog.html' && flag && location.pathname !== '/profile.html') {
			location.href = '/blog.html';
		}
	} else {
		console.log('user logout hogya');
		if (location.pathname !== '/index.html' && location.pathname !== '/blog.html') {
			location.href = '/index.html';
		}
	}
});

// // Show Password
// const showPass = document.getElementById('showPassword');
// const showPassword = () => {
// 	let pass = document.getElementById('password');
// 	pass.type = 'text';
// };
// showPass && showPass.addEventListener('click', showPassword);

// Loader
const spiner = document.getElementById('spiner');
function showLoader() {
	spiner.style.display = 'flex';
}
function hideLoader() {
	spiner.style.display = 'none';
}

// Sign  Up Button
	const userNameElement = document.getElementById('userName');
	const userEmailElement = document.getElementById('userEmail');
	const signupBtn = document.getElementById('signupBtn');
const signup = () => {
	let fullName = document.getElementById('fullName');
	let Password = document.getElementById('passwordSignUp');
	let email = document.getElementById('emailSignUp');

	const user = {
		fullName: fullName.value,
		email: email.value,
		Password: Password.value,
	};
	if (!user.fullName || !user.email || !user.Password) {
		Swal.fire('Please fill out  all fields');
		return;
	}
	flag = false;

	createUserWithEmailAndPassword(auth, user.email, user.Password)
		.then(async (res) => {
			const user = res.user;
			showLoader();
			console.log(user);
			await setDoc(doc(db, 'UsersSignUp', user.uid), {
				fullName: fullName.value,
				email: email.value,
				Password: Password.value,
				uid: user.uid,
			});
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: 'User has been created',
				showConfirmButton: false,
				timer: 1500,
			});

			hideLoader();
			setTimeout(() => {
				flag = true;
				location.href = "./blog.html";
			}, 2000);
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			let errorText = errorMessage;
			switch (errorMessage) {
				case 'Firebase: Error (auth/invalid-email).':
					errorText = 'Invalid Email';
					break;
				case 'Firebase: Error (auth/email-already-in-use).':
					errorText = 'This email is already in use. Try different';
					break;
				default:
					errorText = errorText;
			}
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: errorText,
			});
			hideLoader();
		});
};
signupBtn && signupBtn.addEventListener('click', signup);

// Sign IN
const signinBtn = document.getElementById('signInBtn');
const signIn = () => {
	let email = document.getElementById('email');
	let password = document.getElementById('password');
	if ((!email.value, !password.value)) {
		Swal.fire('Please fill out  all fields');
		return;
	}
	showLoader();
	signInWithEmailAndPassword(auth, email.value, password.value)
		.then((res) => {
			const user = res.user;
			console.log(user);
			hideLoader();
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: 'Loggined In',
				showConfirmButton: false,
				timer: 1500,
			});
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			hideLoader();
			let errorText = errorMessage;
			switch (errorMessage) {
				case 'Firebase: Error (auth/wrong-password).':
					errorText = 'Invalid Password';
					break;
				case 'Firebase: Error (auth/user-not-found).':
					errorText = 'Email is not correct';
					break;
				default:
					errorText = 'Something went wrong';
			}
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: errorText,
			});
		});
};
signinBtn && signinBtn.addEventListener('click', signIn);

// Sign Out
const logoutBtn = document.getElementById('Logout');
const signoutUser = () => {
	signOut(auth)
		.then(() => {
			// Sign-out successful.
			hideLoader();
			location.href = "./index.html";
		})
		.catch((error) => {
			// An error happened.
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: errorText,
			});
		});
};
// signOutBtn.addEventListener('click',userSignOut);
logoutBtn && logoutBtn.addEventListener('click', signoutUser);

// update data

const updateBtn = document.getElementById('updateBtn');

const updateUser = async () => {
	showLoader()
	console.log('yest');
	let fullName = document.getElementById('fullName');
	let Password = document.getElementById('password');
	let userUid = document.getElementById('uid');

	// console.log(fullName.value, Password.value, userUid.value);

	const userRef = doc(db, 'UsersSignUp', userUid.value);

	// Set the "capital" field of the city 'DC'
	await updateDoc(userRef, {
		fullName: fullName.value,
		password: Password.value,		
	});
	hideLoader()
	Swal.fire('Profile', 'Profile Updated', 'success');
};

updateBtn && updateBtn.addEventListener('click', updateUser);

	
