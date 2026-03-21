import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const updateCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(""); // Reset subcategory when main category changes
  };

  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory: updateCategory, selectedSubcategory, setSelectedSubcategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
