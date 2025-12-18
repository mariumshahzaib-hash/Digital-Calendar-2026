console.log("JS Connected!");

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://eofjpxzrzjuptlkwxwgm.supabase.co";
const supabaseKey = "sb_publishable_GrTpM2UFNwxGWS3THVm2jQ_8Pz3W3VI";

const supabase = createClient(supabaseUrl , supabaseKey);

const {data: {user}} = await supabase.auth.getUser();
if(user){
  window.location.href = "index.html";
}

async function handleLogin(){
    let loginUsername = document.getElementById("loginUsername");
    let loginPassword = document.getElementById("loginPassword");

    
    const email = `${loginUsername.value.trim()}@planner.app`

    if(!loginUsername.value.trim() || !loginPassword.value.trim()){
        Swal.fire({
            title: "Error!",
            text: "Please Fill All The Fields!",
            icon: "error"
        })
        return;
    }
    const {data: loginData , error: loginError} = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword.value.trim()
    });

    if(loginError){
        Swal.fire({
            title: "Error!",
            text: "Error: " + loginError.message,
            icon: "error"
        })
        return;
    }

    Swal.fire({
        title: "Success",
        text: "Login Successfully!",
        icon: "success"
    });

    setInterval(() => {
        window.location.href = "index.html";
    } , 4000)
}

const userLogin = document.getElementById("userLogin");
userLogin.addEventListener('click' , (e) =>{
    e.preventDefault();
    const key = e.keyCode || e.which
    if(key === 13){
        handleLogin();
        return;
    }
    handleLogin()
})