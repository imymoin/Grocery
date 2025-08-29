import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const InputField = ({type, placeholder, name, handleChange, address}) =>(
    <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
    type={type} 
    placeholder={placeholder} 
    name={name} 
    onChange={handleChange} 
    value={address[name]} 
    required
    />
)

const AddAddress = () => {
  const {axios, navigate} = useAppContext();

  const [address, setAddress] = useState({
    "First Name": "",
    "Last Name": "",
    "Address": "",
    "City": "",
    "State": "",
    "Zip Code": "",
    "Country": "",
    "phone": ""
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setAddress((prev) => ({...prev, [name]: value}));
  }

 const onSubmitHandler = async (e) => {
   e.preventDefault();
   try {
       const {data} = await axios.post('/api/user/address', {address});
       if(data.success){
           toast.success(data.message);
           navigate('/cart');
       }else{
           toast.error(data.message);
       }
   } catch (error) {
        toast.error(error.message);
   }
 }

 useEffect(()=>{
    if(!user){
      navigate('/cart');
    }
 }, [])

  return (
    <div className='mt-16 pb-16'>
        <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span className='font-semibold text-[#4fbf8b]'>
             Address</span></p>
             <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
             <div className='flex-1 max-w-md'>
              <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
                
                <div className='grid grid-cols-2 gap-4'>
                  <InputField handleChange={handleChange} address={address} 
                  name="First Name" type="text" placeholder="First Name" />
                   <InputField handleChange={handleChange} address={address} 
                  name="Last Name" type="text" placeholder="Last Name" />
                </div>

                <InputField handleChange={handleChange} address={address} 
                name="Email" type="email" placeholder="Email" />
                <InputField handleChange={handleChange} address={address} 
                name="Street" type="text" placeholder="Street" />
                
                <div className='grid grid-cols-2 gap-4'>
                  <InputField handleChange={handleChange} address={address} 
                  name="City" type="text" placeholder="City" />
                   <InputField handleChange={handleChange} address={address} 
                  name="State" type="text" placeholder="State" />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <InputField handleChange={handleChange} address={address} 
                  name="Zip Code" type="number" placeholder="Zip Code" />
                   <InputField handleChange={handleChange} address={address} 
                  name="Country" type="text" placeholder="Country" />
                </div>

                <InputField handleChange={handleChange} address={address} 
                  name="phone" type="text" placeholder="Phone" />

                  <button className='w-full mt-6 bg-[#4fbf8b] text-white py-3 hover:bg-[#44ae7c] transition cursor-pointer uppercase'>
                    Save Address
                    </button>

              </form>
             </div>
             <img className='ms:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="Add Address" />
             </div>
    </div>
  )
}

export default AddAddress;