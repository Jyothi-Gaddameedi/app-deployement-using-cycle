import React from 'react'
import TopNavigation from './TopNavigation'
import { useDispatch, useSelector } from 'react-redux'

function Home() {
  let dispatch=useDispatch();
  let storeObj=useSelector((store)=>{
    return store
  });
console.log(storeObj);

  return (
    <div className='App'>
      <TopNavigation/>
        <h2>Home</h2>
        <h2>Hi,Welcome to {storeObj.userReducer.loginDetails.firstName} {storeObj.userReducer.loginDetails.lastName}</h2>
        <img src={`http://localhost:1111/${storeObj.userReducer.loginDetails.profilePic}`}></img>
    <div>
      <button
      onClick={()=>{
        dispatch({type:"addTask",data:1})
      }}
      >Add Task</button>
      <button onClick={()=>{
        dispatch({type:"deleteTask",data:1})
      }}>Delete Task</button>
      <button onClick={()=>{
        dispatch({type:"editTask",data:1})
      }}>Edit Task</button>
      <button onClick={()=>{
        dispatch({type:"addLeave",data:1})
      }}>Add Leave</button>
      <button onClick={()=>{
        dispatch({type:"editLeave",data:1})
      }}>Edit Leave</button>
      <button onClick={()=>{
        dispatch({type:"removeLeave",data:1})
      }}>Remove Leave</button>
    </div>
    </div>
  )
}

export default Home