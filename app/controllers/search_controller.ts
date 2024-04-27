// SearchController.ts

'use strict'

import { HttpContext } from "@adonisjs/core/http"
import db from "@adonisjs/lucid/services/db"

export default class SearchController {

    public async getSearchResults({ request, view }: HttpContext) {
        const { searchInput } = request.all();
    
        const adsWithUsers = await db
        .from('newad')
        .where('title', 'like', `%${searchInput}%`)
        .innerJoin('users', 'newad.user_id', 'users.id')
        .select('newad.title', 'newad.price', 'newad.image', 'newad.description', 'newad.state', 'newad.adress', 'newad.deactivated', 'users.*');
  
      return view.render('pages/search', { newads: adsWithUsers });
    }
    async deactivateAd({ request, response }:HttpContext) {
      const adId = request.input('ad_id');
      
      try {
          await db.from('newad').where('id', adId).update({ deactivated: 1 });
          return response.redirect().back();
      } catch (error) {
          console.error('Error deactivating ad:', error);
          return response.status(500).send({ error: 'Internal server error.' });
      }
  }
  
    
    
  }
  

