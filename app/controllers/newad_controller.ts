import { cuid } from "@adonisjs/core/helpers";
import { HttpContext } from "@adonisjs/core/http"
import app from "@adonisjs/core/services/app";
import db from "@adonisjs/lucid/services/db"

export default class NewadController {

    public async getNewad({ view }: HttpContext) {
        return view.render('pages/newad');
    }

    public async create({ request, response, session, view }: HttpContext) {
        if (request.method() === 'POST') {
            const { title, price, state, description, adress } = request.all();
            const user = session.get('user');
            const image = request.file('upload');
            let fileName = 'afakprnkxpqc0608g6vx6b73.jpeg';

            if (image) {
                fileName = `${cuid()}.${image.extname}`;
                await image.move(app.publicPath('uploads'), { name: fileName });
            }

            if (!user) {
                console.error("Benutzerdaten nicht verfügbar");
                return response.redirect().toRoute('/auth');
            }

            if (parseFloat(price) < 0) {
                return view.render( 'pages/newad', {newadMessage: 'Der Preis darf nicht negativ sein!'});
            }
            

            await db.table('newad').insert({
                title: title,
                price: price,
                state: state,
                image: fileName,
                adress: adress ? adress : "Adresse nicht gegeben",
                description: description ? description : "Beschreibung nicht gegeben",
                user_id: user.id,
                deactivated: 0
            });

            const userAds = await db.from('newad').where('user_id', user.id).select('*');

            const userAdsArray = userAds.map(ad => ({
                id: ad.id,
                state: ad.state,
                title: ad.title,
                price: ad.price,
                adress: ad.adress,
                image: ad.image,
                description: ad.description,
                deactivated: 0
            }));

            return response.redirect().toRoute('/profile', { user, userAds: userAdsArray });
        }
    }
}
