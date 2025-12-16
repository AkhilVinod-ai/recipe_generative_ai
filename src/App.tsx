import { useState, type FormEvent } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "./App.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const ingredientList = ingredients.split(",").map((i) => i.trim());
      
      // FIX ADDED HERE: explicitly use userPool auth
      const { data, errors } = await client.queries.askBedrock({
        ingredients: ingredientList,
      }, {
        authMode: 'userPool'
      });

      if (!errors && data) {
        setRecipe(data.body || "No recipe generated.");
      } else {
        console.error(errors);
        setRecipe("Error generating recipe.");
      }
    } catch (e) {
      console.error(e);
      setRecipe("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new recipe
          on demand...
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
          </div>
        ) : (
          recipe && (
            <div className="result">
              <p>{recipe}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;