import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = "https://www.themealdb.com/api/json/v1/";
const api_key = "1";

app.use(express.static (path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.set('view engine', 'ejs');

//This is for the homepage
app.use((req, res, next) => {
    res.locals.year = new Date().getFullYear();

    next();
});
app.get("/", async(req, res) =>{

    try{

        const endpoint1 = "random.php"
        const endpoint2 = "categories.php"

        const [response1,  response2] = await Promise.all([
            axios.get(`${API_URL}${api_key}/${endpoint1}`),
            axios.get(`${API_URL}${api_key}/${endpoint2}`)
        ]);
    

        const result1 = response1.data
        const result2 = response2.data

        return res.render('index', { 
            title: "capstone Project",
            meal: result1,
            category: result2
        });
    } catch(error){
        console.error(error.message);
        return res.status(500).render('index', {
            title: "Capstone Project",
            meal: { meals: null },
            category: { categories: [] }
        })
    }
});

//This is to get the recipe

app.get("/recipe/:id", async(req, res) =>{

    const mealID = req.params.id;
    const endpoint = "lookup.php";
    const endpoint2 = "categories.php";
    

    try{
        const response = await axios.get(`${API_URL}${api_key}/${endpoint}`,{
            params:{
                i: mealID
            }
        });
        
        const result = response.data;
        const mealData = result.meals[0]


        let ingridentlist = [];

        for (let i = 1; i<=20; i++){

            let ingrident = mealData[`strIngredient${i}`];
            let measure = mealData[`strMeasure${i}`];

            if (ingrident && ingrident.trim() !== "" ){
                ingridentlist.push(`${ingrident.trim()} ${measure ? measure.trim(): ""}`)
            }
        }

        return res.render('recipe', { 
            title: "Recepie Detail",
            meal: mealData,
            ingridents: ingridentlist
        });
    } catch(error){
        console.error(error.message)
        return res.status(500).send("Could not load recipe!")
    }
});

//This is to get a new meal

app.get("/newmeal", async(req, res) =>{

    const endpoint1 = "random.php";
    const endpoint2 = "categories.php"

    try{
        const [response1,  response2] = await Promise.all([
            axios.get(`${API_URL}${api_key}/${endpoint1}`),
            axios.get(`${API_URL}${api_key}/${endpoint2}`)
        ]);
    

        const result1 = response1.data
        const result2 = response2.data


        res.render('index', { 
            title: "capstone Project",
            meal: result1,
            category: result2
        });
    } catch(error){
        console.error(error.message);
        return res.status(500).send("Could not load recipe!")

    }
});

app.post("/search", async(req, res) =>{
    const searchFood = req.body.search;
    const endpoint = "search.php";
     const endpoint2 = "categories.php";

    try{
        const [response, response2] = await Promise.all([
            axios.get(`${API_URL}${api_key}/${endpoint}`,{
                params:{
                    s: searchFood
                }
            }),
            axios.get(`${API_URL}${api_key}/${endpoint2}`)
]) 

    const result = response.data;
    const result2 = response2.data;

    if (!result.meals){
        return res.render('index',{
            title: "My Search",
            meal : {meals: []},
            category:result2 
        })
    }

    return res.render('index',{
        title: "My Search",
        meal: result,
        category: result2
    })
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Can't find food")
    }
});


app.listen(PORT, () =>{
    console.log(`Server is running on https//localhost:${PORT}`)
})