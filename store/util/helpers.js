function registerValidate(username, password, password2){
	let errors = [];

	if(!username || !password || !password2){
		errors.push({message: "Please enter all fields."})
	}
	if(password.length < 6){
		errors.push({message: 'Password should be at lease 6 characters.'})
	}
	if(password != password2){
		errors.push({message: 'Passwords do not match.'})
	}
	return errors
}

module.exports = {registerValidate}