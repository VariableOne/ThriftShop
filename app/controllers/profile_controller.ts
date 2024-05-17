import db from '@adonisjs/lucid/services/db';
import type { HttpContext } from "@adonisjs/core/http";
import hash from '@adonisjs/core/services/hash';
import app from '@adonisjs/core/services/app';
import { cuid } from '@adonisjs/core/helpers';


export default class ProfileController {

    public async updateProfilePicture({ request, session, response, view }: HttpContext) {

        const { image, telephone, email, firstname, lastname, username, password, newPassword } = request.all();
        const user = session.get('user');

        let finalPassword = null;
        if (newPassword && newPassword.trim() !== '') {
            finalPassword = await hash.make(newPassword);
        } else {
            finalPassword = user.password;
        }

        const img = request.file('image');
        if (!img) {

            if (password === newPassword) {
                console.log("Passwords has to be different!");
                return view.render('pages/profile', { user, profileError: "Passwörter dürfen nicht gleich sein!" });
            }
    
            const uppercaseChars = newPassword.match(/[A-Z]/g);
            const digitChars = newPassword.match(/[0-9]/g);
            if (newPassword.length < 8 || !uppercaseChars || uppercaseChars.length < 2 || !digitChars || digitChars.length < 2) {
                console.log("Password has to contain 8 letters");
                return view.render('pages/profile', { user,profileError: 'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Großbuchstaben sowie 2 Zahlen enthalten!' });
            }

            if(finalPassword != session.get('user').password){
                console.log("Old Password not correct");
                return view.render('pages/profile', { user,profileError: 'Altes Passwort stimmt nicht!' });
            }

            
            await db.from('users').where('id', user.id).update({
                firstname: firstname || user.firstname,
                lastname: lastname || user.lastname,
                email: email || user.email,
                username: username || user.username,
                password: finalPassword,
                telephone: telephone || user.telephone
            });

            user.firstname = firstname || user.firstname;
            user.lastname = lastname || user.lastname;
            user.email = email || user.email;
            user.username = username || user.username;
            user.telephone = telephone || user.telephone;

            session.put('user', user);


            const userAds = await db.from('newad').where('user_id', user.id);

            return response.redirect().toRoute('/profile', { user, userAds });
        }

      
        if (password === newPassword) {
            console.log("Passwords has to be different!");
            return view.render('pages/profile', { user, profileError: "Passwörter dürfen nicht gleich sein!" });
        }

        const uppercaseChars = password.match(/[A-Z]/g);
        const digitChars = password.match(/[0-9]/g);
        if (password.length < 8 || !uppercaseChars || uppercaseChars.length < 2 || !digitChars || digitChars.length < 2) {
            console.log("Password criteria not met");
            return view.render('pages/profile', { user,profileError: 'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Großbuchstaben sowie 2 Zahlen enthalten!' });
        }


        
        const fileName = `${cuid()}.${img.extname}`;

        await img.move(app.publicPath('uploads'), { name: fileName });

        const fullFilePath = `${app.publicPath('uploads')}/${fileName}`;

        //Anpassung der Profildaten
        await db.from('users').where('id', user.id).update({
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            email: email || user.email,
            username: username || user.username,
            password: finalPassword,
            telephone: telephone || user.telephone,
            profile_picture: fileName || user.profile_picture,
            path: fullFilePath || user.path
        });

        await db.from('newad').where('user_id', user.id).select('*').update({
            user_id: user.id
        });

        //falls die restlichen Profildaten gelcih bleibene,w erden deise nicht verändert
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.telephone = telephone || user.telephone;
        user.profile_picture = fileName || user.profile_picture;
        user.path = fullFilePath || user.path;

        session.put('user', user);

        console.log(image, email, firstname, lastname, username, password, newPassword);

        const userAds = await db.from('newad').where('user_id', user.id);

        return response.redirect().toRoute('/profile', { user, userAds });
    }

    public async getHome({ view, session }: HttpContext) {
        const user = session.get('user');
        if (user) {
            const newads = await db.from('newad').where('user_id', user.id);
            const messages = await db.from('messages').where('sender_id', user.id);
            return view.render('pages/home', {user, newads, messages });
        }
    }


}