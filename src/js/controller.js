import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';




// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function(){
  try{
   const id = window.location.hash.slice(1);
   if(!id) return;
   recipeView.renderSpinner();
   await model.loadRecipe(id);
   recipeView.render(model.state.recipe);   
   resultsView.update(model.getSearchResultsPage());
   bookmarksView.update(model.state.bookmarks);
  }catch(err){
     recipeView.renderError();
  }
}

const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();
    const query = (searchView.getQuery());
    if(!query) return;
   await model.loadSearchResults(query);
   resultsView.render(model.getSearchResultsPage());
   paginationView.render(model.state.search);
  }catch(err){
    recipeView.renderError();
  }
}

const controlPagination = function(goToPage){
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
}

const controlServings = function(newServings){
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);   
}

const controlAddBookmarks = function(){
  if(!model.state.recipe.bookmarked)
  model.addBookmarks(model.state.recipe);
  else
  model.removeBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  try{
  addRecipeView.renderSpinner();
  await model.uploadRecipe(newRecipe);

 recipeView.render(model.state.recipe);
 bookmarksView.render(model.state.bookmarks);

 window.history.pushState(null, '', `#${model.state.recipe.id}`);

 addRecipeView.renderMessage();
 setTimeout(function(){
   addRecipeView._toggleWindow()

 }, MODAL_CLOSE_SEC * 1000 )
  }catch(err){
    console.error(err);
    addRecipeView.renderError(err);
  }
}



const init = function(){
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmarks(controlAddBookmarks);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addUploadHandler(controlAddRecipe);

}

init();
  

