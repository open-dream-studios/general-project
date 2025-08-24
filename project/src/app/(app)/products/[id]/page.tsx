"use client";
import { useContext } from "react";
import { useParams } from "next/navigation";
import { AuthContext } from "@/contexts/authContext";
import ProductsPage from "@/components/ProductPage/ProductPage";

const Product = () => {
  const { currentUser } = useContext(AuthContext);
  const params = useParams();
  const serialNumber = params?.id as string;

  if (!currentUser) return null;

  return <ProductsPage serialNumber={serialNumber} />;
};

export default Product;
