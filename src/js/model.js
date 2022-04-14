import { API_URL, key } from "./config.js";
import { RESULTS_PER_PAGE } from "./config.js";
import {getJSON, sendJSON} from "./helpers.js";
export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RESULTS_PER_PAGE,
        page: 1
    },
    bookmarks: []
}

const createRecipeObject = function(data){
  const {recipe} = data.data;
  return{
    id: recipe.id, 
    title: recipe.title,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    publisher: recipe.publisher,
    cookingTime: recipe.cooking_time,
    ...(recipe.key && {key: recipe.key})
  }
}

export const loadRecipe = async function(id){
   try{
    const data  = await getJSON(`${API_URL}${id}`)
  
    state.recipe = createRecipeObject(data);
       
    
    if(state.bookmarks.some(bookmark => bookmark.id === id)){
      state.recipe.bookmarked = true;
    }
    else{
      state.recipe.bookmarked = false;
    }
  }catch(err){
      console.error(err);
      throw err;
  }
}

export const loadSearchResults = async function(query){
    try{
      state.search.query = query;
      const data = await getJSON(`${API_URL}?search=${query}`);
      state.search.results = data.data.recipes.map((rec) => {
          return {
            id: rec.id, 
            title: rec.title,
            image: rec.image_url,
            ingredients: rec.ingredients,
            publisher: rec.publisher,
            ...(rec.key && {key: rec.key})
          }
        })
      state.search.page = 1;
    }catch(err){
        console.error(err);
        throw err;
    }
}

export const getSearchResultsPage= function(page = state.search.page){
  state.search.page = page;
  const start = (page-1)*state.search.resultsPerPage;
  const end = page*state.search.resultsPerPage;
  return state.search.results.slice(start, end);
}

export const updateServings= function(newServings = state.recipe.servings){
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (newServings * ing.quantity)/state.recipe.servings;
  });
  state.recipe.servings = newServings;
}

const persistBookmarks = function(){
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmarks = function(recipe){
  state.bookmarks.push(recipe);
  if(recipe.id === state.recipe.id)
  state.recipe.bookmarked = true;
  persistBookmarks();
}

export const removeBookmark = function(id){
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  if(id === state.recipe.id)
  state.recipe.bookmarked = false;
  persistBookmarks();
}

const init = function(){
  const storage = localStorage.getItem('bookmarks');
  if(storage) state.bookmarks = JSON.parse(storage);
}

export const uploadRecipe = async function(newRecipe){
  try{
    const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1]!= '').map(
      ing => {
        const ingArray = ing[1].replaceAll(" ", '').split(',');
        if(ingArray.length !== 3){
          throw new Error('Invalid input format! Please use the correct format!');
        }
        const [quantity, unit, description] = ingArray;
        return {quantity: quantity ? +quantity : null , unit, description}
      }
      
    )
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      ingredients: ingredients,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings
    }
    
    const data = await sendJSON(`${API_URL}?key=${key}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmarks(recipe);
  }catch(err){
    throw err;
  }

}

init();

// const clearBookMarks = function(){
//   localStorage.clear();
// }

// clearBookMarks();