import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const router = express.Router();
router.use(cors());
router.use(express.json());

router.post('/process', async (req, res)=>{
  const prompt = req.body.message || "";
  try{
    const response = await openai.chat.completions.create({
      model: "gpt-4o-turbo",
      messages:[
        {role:"system",content:"Eres José Carlos y respondes brevemente preguntas frecuentes sobre tu trayectoria profesional."},
        {role:"user",content:prompt}
      ],
      temperature:0.4,
      max_tokens:180
    });
    const result = response.choices[0].message.content.trim();
    res.json({result});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"OpenAI error"});
  }
});

export default router;

/* ---------- servidor ----------------------*/
import http from 'http';
const app = express();
app.use('/', router);
http.createServer(app).listen(3000, ()=>console.log('API running on :3000'));
