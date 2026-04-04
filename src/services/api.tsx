// import dotenv from 'dotenv';

// dotenv.config();

// const PORT = process.env.PORT || 3000;
// const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}/api`;
const API_BASE_URL = "http://localhost:4000/api"
export const fetchListGames = async () => {
  const path_name = "/game/list-games";
  const url = `${API_BASE_URL}${path_name}`;
  
  const response = await fetch(url);
  return await response.json();
};