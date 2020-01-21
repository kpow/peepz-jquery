const searchContainer = document.querySelector('.search-container')
const galleryContainer = document.querySelector('.gallery')
const modalContainer = document.querySelector('#modal')
let userData = null
let currentItemIndex = null
let searchList = []

function fetchData(url){
    return fetch(url)
            .then(checkStatus)
            .then(res=>res.json())
            .catch(error=>console.log('oops', error))
}

function checkStatus(response){
    if(response.ok){
        return Promise.resolve(response)
    }else{
        return Promise.reject(new Error(response.statusText))
    }
}

function addSearchBarHTML(){
    const searchBar = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>
    `
    searchContainer.innerHTML = searchBar

    document.querySelector('#search-submit').addEventListener('click', (e)=>{
        e.preventDefault();
        const searchInput = document.querySelector('input').value
        search(document.querySelector('input'),searchInput )
    })

    document.querySelector('#search-input').addEventListener('keyup', (e)=>{
        const searchInput = document.querySelector('input').value
        search(document.querySelector('input'),searchInput )
     })
}

function generateCardsHTML(data){
    let html = ''
    data.map((item, index) =>{
        searchList.push(index)
        html += `
        <div class="card" id="${index}">
            <div class="card-img-container">
                <img class="card-img" src="${item.picture.thumbnail}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${item.name.first} ${item.name.last}</h3>
                <p class="card-text">${item.email}</p>
                <p class="card-text cap">${item.location.city}, ${item.location.state}</p>
            </div>
        </div>
        `
    })

    galleryContainer.innerHTML = html

}

function displayModal(item, index){

    currentItemID = index
    currentItemIndex = index

    const modal = `
    <div class="modal-container">
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
            <div class="modal-info-container">
                <img class="modal-img" src="${item.picture.thumbnail}" alt="profile picture">
                <h3 id="name" class="modal-name cap">${item.name.first} ${item.name.last}</h3>
                <p class="modal-text">${item.email}</p>
                <p class="modal-text cap">${item.location.city}</p>
                <hr>
                <p class="modal-text">${item.phone}</p>
                <p class="modal-text">${item.location.street.number} ${item.location.street.name}, ${item.location.city}, ${item.location.state} ${item.location.postcode}</p>
                <p class="modal-text">Birthday: ${item.dob.date}</p>
            </div>
        </div>

        // IMPORTANT: Below is only for exceeds tasks 
        <div class="modal-btn-container">
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        </div>
    </div>
    `

    modalContainer.innerHTML = modal;
    document.querySelector('#modal-close-btn').addEventListener('click', e =>  modalContainer.innerHTML = '')
    document.querySelector('.modal-btn-container').addEventListener('click', e => nextPrevItem(e) )

}

function nextPrevItem(e){
    if(e.target.id === 'modal-next'){
        if(currentItemID < userData.length-1){
            displayModal(userData[currentItemID+1], currentItemID+1 ) 
        }else if(currentItemID >= userData.length-1){
            displayModal(userData[0], 0 ) 
        }
    }else if(e.target.id === 'modal-prev'){
        if(currentItemID > 0){
            displayModal(userData[currentItemID-1], currentItemID-1 ) 
        }else if(currentItemID <= 0){
            displayModal(userData[userData.length-1], userData.length-1 ) 
        }
    }

}

function nextPrevItem(e){
    console.log(searchList)
    if(e.target.id === 'modal-next'){

        if(currentItemIndex < searchList.length-1){
            displayModal(userData[searchList[currentItemIndex+1]], currentItemIndex+1 ) 
        }else if(currentItemIndex >= searchList.length-1){
            displayModal(userData[0], 0 ) 
        }

    }else if(e.target.id === 'modal-prev'){
        if(currentItemIndex > 0){
            displayModal(userData[searchList[currentItemIndex-1]], currentItemIndex-1 ) 
        }else if(currentItemIndex <= 0){
            displayModal(userData[searchList[currentItemIndex.length-1]], searchList.length-1 ) 
        }
    }

}

function getTargetID(e){
    let itemID

    if( e.target.className.includes('container') ){
        itemID = e.target.parentNode.id      
    }else if(e.target.className.includes('card-text') || 
        e.target.className.includes('card-name')||
        e.target.className.includes('card-img')){
            itemID = e.target.parentNode.parentNode.id 
    }else if(e.target.className === 'card'){
        itemID = e.target.id 
    }

    return itemID
}

// function to search the input against the list
const search = ( searchInput, name) => {
    // turn them all off
    document.querySelectorAll('.card').forEach(card => card.style.display = 'none')
    // reset the array to store matches in
    searchList = []
    //lets loop through it and see what matches
    for(let i = 0; i<userData.length; i++){
       // get the name to match against
       const firstName = userData[i].name.first.toLowerCase()
       const lastName = userData[i].name.last.toLowerCase()
         // if we "include" the string push to array and toggle it element on
       if( firstName.includes(name.toLowerCase()) || lastName.includes(name.toLowerCase()) ){
          searchList.push(i)
          searchList.map( id => document.getElementById(id).style.display = 'flex' )
       }        
    }

    // if we have a match
    if(searchList.length > 0){
       
    }else{
       // if not show the error message
  
    }
    
 }

galleryContainer.addEventListener('click', e => {
    if( e.target.className.includes('card') ){
        currentItemID = Number(getTargetID(e))
        displayModal(userData[currentItemID], currentItemID)    
    }
})

fetchData('https://randomuser.me/api/?results=12&nat=us')
.then( data => {
    generateCardsHTML(data.results)
    addSearchBarHTML();
    userData = data.results
} )
