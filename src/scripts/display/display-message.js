export async function displayMassage(message){
    let el = document.getElementById('message-container')
    el.innerHTML = message
    console.log("shown message:", message)
}