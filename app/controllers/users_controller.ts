import type { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";
import db from '@adonisjs/lucid/services/db';

export default class UsersController{

    public async logout({session, view}: HttpContext){
        
            session.forget('user');
            return view.render('pages/auth');
    }

    public async loginForm({view}: HttpContext){

        return view.render('pages/auth');
    }

    public async loginProcess({ view, request, session }: HttpContext) {
        
        const result = await db.from('users').select('*').where('username', request.input('username')).first();
    
        if (!result) {
            console.log("User does not exist");
            return view.render('pages/auth', { loginError: 'Benutzername oder Passwort ist falsch.' });
        }
    
        const authenticated = await hash.verify(result.password, request.input('password'));
    
        if (!authenticated) {
            console.log("Password incorrect");
            return view.render('pages/auth', { loginError: 'Benutzername oder Passwort ist falsch.' });
        }

        const user = {
            id: result.id,
            firstname: result.firstname || result.firstname ? result.firstname : "Vorname nicht gegeben",
            lastname: result.lastname || result.lastname ? result.lastname : "Nachname nicht gegeben",
            email: result.email,
            username: result.username,
            telephone: result.telephone || result.telephone ? result.telephone : "Telefon nicht gegeben",
            path: result.path || result.path ? result.path : "uploads/default.jpeg",
            profile_picture: result.profile_picture,
            hasMessage: result.hasMessage
        };
        
        session.put('user', user);


        const newads = await db.from('newad').where('user_id', user.id).select('*');

        const newadsArray = [];
        for (const ad of newads) {
            const newad = {
                id: ad.id,
                title: ad.title,
                price: ad.price,
                images: ad.images 
            };

            newadsArray.push(newad);
        }
        
        return view.render('pages/home', { user, newads });
    }
    
    public async registerForm({view}: HttpContext){

        return view.render('pages/registration');
    }
    public async registerProcess({request, view}: HttpContext){

    const username = request.input('username');
    const email = request.input('email');
    const password = request.input('password');
    const confirmPassword = request.input('confirmPassword');
    
    if (!username || !email || !password || !confirmPassword) {
        console.log("Data incomplete");
        return view.render('pages/registration', { registrationError: 'Bitte füllen Sie alle Felder aus!' });
    }

    if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return view.render('pages/registration', { registrationError: 'Passwort und Bestätigungspasswort stimmen nicht überein!' });
    }

    const uppercaseChars = password.match(/[A-Z]/g);
    const digitChars = password.match(/[0-9]/g);
    if (password.length < 8 || !uppercaseChars || uppercaseChars.length < 2 || !digitChars || digitChars.length < 2) {
        console.log("Password criteria not met");
        return view.render('pages/registration', { registrationError: 'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Großbuchstaben sowie 2 Zahlen enthalten!' });
    }

    const existingUser = await db.from('users').where('username', username).orWhere('email', email).first();
    if (existingUser) {
        console.log("User already exists");
        return view.render('pages/registration', { registrationError: 'Sie sind bereits registriert!' });
    }

    const hashedPassword = await hash.make(password);
    const result = await db.table('users').insert({
        username: username,
        email: email,
        password: hashedPassword
    });
    
   return view.render('pages/home', {result});

}
    public async switchToProfile({ view, session }: HttpContext){
            const user = session.get('user');
        if (user) {
            const newads = await db.from('newad').where('user_id', session.get('user').id).select('*');
            const newadsArray = [];
            for (const ad of newads) {
                const newad = {
                    id: ad.id,
                    title: ad.title,
                    price: ad.price,
                    images: ad.images 
                };
    
                newadsArray.push(newad);
            }
            return view.render('pages/profile', { user, newads });
        } else {
            console.error("Benutzerdaten nicht verfügbar");
            return view.render('pages/auth');
        }
}
}