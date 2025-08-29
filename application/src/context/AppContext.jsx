import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";


axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate();
    const [user, setUser] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [showuserLogin, setShowuserLogin] = useState(false);
    const [product, setProduct] = useState([]);

    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});

    //Fetch Seller status
    const fetchSeller = async ()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true);
            }else{
                setIsSeller(false);
            }
        } catch (error) {
            setIsSeller(false);
        }
    }

    //Fetch User Auth Status, User Data and Cart Items
    const fetchUser = async ()=>{
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success){
                setUser(data.user);
                setCartItems(data.cartItems);
            }
        } catch (error) {
            setUser(false);
        }
    }

    //Fetch Products
   const fetchProducts = async ()=>{
    try {
        const { data } = await axios.get('/api/product/list')
        if(data.success){
            setProduct(data.products);
        }
        else{
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
   }
    //Add Product to Cart
    const addtocart = (itemId) => {
        let cartdata = structuredClone(cartItems);

        if(cartdata[itemId])
            {
            cartdata[itemId] +=1;
            }
        else
            {cartdata[itemId] = 1;}

        setCartItems(cartdata);
        toast.success("Added to cart");
    }

    //Update Cart
    const updateCart = (itemId, quantity) => {
        let cartdata = structuredClone(cartItems);

            cartdata[itemId] = quantity;
            setCartItems(cartdata);
            toast.success("Cart updated");
    }

    //Remove Item from Cart
    const removeFromCart = (itemId) => {
        let cartdata = structuredClone(cartItems);
        if(cartdata[itemId])
            {
            cartdata[itemId] -= 1;
            if(cartdata[itemId] === 0)
                {delete cartdata[itemId];}
            }
        toast.success("Removed from cart");
        setCartItems(cartdata);
    }

    //Get cart item count
    const getcartcount = ()=>
    {
        let totalcount = 0;
        for(const item in cartItems)
        {
            totalcount += cartItems[item];
        }
        return totalcount;
    }

    //Get cart Total Amount
    const getcartamount = ()=>
    {
        let totalamount = 0;
        for(const item in cartItems)
        {
            let iteminfo = product.find((product) => product._id === item);
            if(cartItems[item]>0){
                totalamount += iteminfo ? iteminfo.price * cartItems[item] : 0;
            }
        }
        return totalamount;
    }

    useEffect(() => {
        fetchUser();
        fetchSeller();
        fetchProducts();
    }, []);


    useEffect(() => {
        const updateCart = async ()=>{
            try {
                const {data} = await axios.post('/api/cart/update', {cartItems});
                if(!data.success){
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
        if(user){
            updateCart();
        }
    },[cartItems]);

    const value = {
        navigate,
        user,
        setUser,
        isSeller,
        showuserLogin,
        setShowuserLogin,
        setIsSeller,
        product,
        currency,
        addtocart,
        updateCart,
        removeFromCart,
        cartItems,
        products: product,
        searchQuery,
        setSearchQuery,
        getcartamount,
        getcartcount,
        axios,
        fetchProducts,
        setCartItems
    };
    
    return (
        <AppContext.Provider value={ value }>
        {children}
        </AppContext.Provider>
    );
    };
    export const useAppContext = () => useContext(AppContext);