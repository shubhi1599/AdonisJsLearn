// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import axios from "axios";
import Env from '@ioc:Adonis/Core/Env'

/** File to access third party API's */
export default class TpAaccessesController {

    public async index({ response }) {
        try {
        
          let queries = ['Ocean', 'Tigers', 'Pears', 'nature', 'flower', 'landscape', 'sky', 'moon']  
          const randomQuery = queries[Math.floor(Math.random() * queries.length)];

          const apiKey = Env.get('PEXELS_API_KEY');
          // const query = 'Nature';
          const perPage = 20;
    
          const url = `https://api.pexels.com/v1/search?query=${randomQuery}&per_page=${perPage}`;
    
          const headers = {
            'Authorization': `${apiKey}`,
          }

          const pexelsResponse = await axios.get(url, { headers })
    
          const photos = pexelsResponse.data;
    
          return response.send({message: photos})
        } catch (error) {
          console.error('Error:', error);
          return response.status(error.response?.status || 500).json({ error: error });
        }
      }
}