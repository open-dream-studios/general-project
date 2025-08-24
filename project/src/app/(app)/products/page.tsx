"use client";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/authContext";
import React from "react";
import { useAppContext } from "@/contexts/appContext";
import CustomInventoryFrameSkeleton from "@/components/CustomInventoryFrame/CustomInventoryFrameSkeleton";
import "react-datepicker/dist/react-datepicker.css";
import { Product, useContextQueries } from "@/contexts/queryContext";
import ProductPage from "../../../components/ProductPage/ProductPage";
import ProductsHeader from "@/components/ProductsHeader/ProductsHeader";
import DraggableProductsGrid from "@/screens/Inventory/DraggableProductsGrid";

const ProductsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { productsData, isLoadingProductsData } = useContextQueries();
  const { addProductPage, filteredProducts } = useAppContext();

  if (!currentUser) return null;

  return (
    <>
      {addProductPage ? (
        <ProductPage />
      ) : (
        <div className="w-[100%] h-[100%] relative">
          <div className="z-[800] absolute top-0 left-0 h-[60px] w-[100%]">
            <ProductsHeader title={"TSA Products"} />
          </div>
          <div className="absolute h-[calc(100%-65px)] mt-[65px] left-0 w-[100%]">
            {productsData && filteredProducts(productsData).length > 0 ? (
              <div className="w-[100%] h-[100%] overflow-y-scroll overflow-x-hidden px-[30px]">
                {productsData && filteredProducts(productsData).length > 0 && (
                  <DraggableProductsGrid sheet={false} />
                )}
                <div className="h-[60px] w-[100%]" />
              </div>
            ) : isLoadingProductsData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[30px]">
                {Array.from({ length: 6 }, (_, index) => {
                  return (
                    <div key={index}>
                      <CustomInventoryFrameSkeleton />
                    </div>
                  );
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;
