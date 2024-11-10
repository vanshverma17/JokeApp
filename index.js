import express from 'express';
import JokeAPI from 'sv443-joke-api';

const app = express();
const port = 3000;

app.use(express.static('public'));  
app.use(express.urlencoded({ extended: true }));  
app.set('view engine', 'ejs');

// Function to fetch a joke from JokeAPI
async function fetchJoke() {
    try {
        const jokeData = await JokeAPI.getJokes().then((res) => res.json());
        console.log('Joke Data:', jokeData); // Log the raw response to inspect its structure
        
        // Check if the response has a `joke` parameter (single joke string)
        if (jokeData.joke) {
            return { category: jokeData.category, joke: jokeData.joke };
        }
        
        // If 'joke' is not available, check for 'setup' and 'delivery'
        if (jokeData.setup && jokeData.delivery) {
            return { category: jokeData.category, setup: jokeData.setup, delivery: jokeData.delivery };
        }
        
        // Fallback if neither joke nor setup and delivery are available
        throw new Error('Joke data is incomplete');
    } catch (error) {
        console.error("Error fetching joke:", error);
        // Return a default joke with a generic category if something goes wrong
        return { category: "General", setup: "Why don't skeletons fight each other?", delivery: "They don't have the guts!" };
    }
}

app.get('/', async (req, res) => {
    // Display a message for the initial page load
    res.render('index', { joke: "Enter your name to get a personalized joke!", category: "Welcome" });
});

app.post('/', async (req, res) => {
    const userName = req.body.name;  // Get the user's name from the form input
    const joke = await fetchJoke();  // Fetch the joke again to customize

    let personalizedJoke = '';
    let jokeCategory = joke.category || "General";

    if (joke.joke) {  // Single joke string format
        personalizedJoke = `${userName}, here's a joke: ${joke.joke}`;
    } else if (joke.setup && joke.delivery) {  // Setup and delivery format
        personalizedJoke = `${userName}, here's a joke: ${joke.setup} ${joke.delivery}`;
    } else {  // Fallback to default joke
        personalizedJoke = `${userName}, here's a default joke: Why don't skeletons fight each other? They don't have the guts!`;
    }
    
    res.render('index', { joke: personalizedJoke, category: jokeCategory });  // Render with the personalized joke and category
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
