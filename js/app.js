// set up some vars for elements we will use
const searchContainer = document.querySelector('.search-container')
const galleryContainer = document.querySelector('.gallery')
const modalContainer = document.querySelector('#modal')
const errorContainer = document.querySelector('.error-container')
// couple of vars to keep track
let isPaging = false;
// place to store data from the api pull
let userData = null
// let keep track on which on is in the modal by its index in the searchlist
let currentItemIndex 
// when we search we create a list of matches
let searchList = []

// function to get and check status of data
const fetchData = (url) => {
    return fetch(url)
            // check the http return code
            .then(checkStatus)
            // turn it into json
            .then(res=>res.json())
            // logan error if we need to
            .catch(error=>console.log('oops', error))
}

// make sure we are actually connecting to server and getting the correct response
const checkStatus = (response) => {
    if(response.ok){
        // if we are all ok resolve
        return Promise.resolve(response)
    }else{
        // if not return an e3rror
        return Promise.reject(new Error(response.statusText))
    }
}

// functionto add search bar to DOM
const addSearchBarHTML = () => {
    const searchBar = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>
    `
    // add to DOM
    searchContainer.innerHTML = searchBar

    // event listener for when you click the submit button 
    document.querySelector('#search-submit').addEventListener('click', (e)=>{
        e.preventDefault();
        const searchInput = document.querySelector('input').value
        search(searchInput)
    })
    // keyboard listener for search input kinda makes the button useless :)
    document.querySelector('#search-input').addEventListener('keyup', (e)=>{
        const searchInput = document.querySelector('input').value
        search(searchInput)
     })
}

const generateCardsHTML = (data) => {
    let html = ''
    data.map((item, index) =>{
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

// function to display the lightbox with navigation arrows
const displayModal = (item, index) => {
    // keep track of current item in modal by index number
    currentItemIndex = parseInt(index)
    // build a modal string and populate it with data
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
                <p class="modal-text">Birthday: 
                ${new Date(item.dob.date).getMonth()} /
                ${new Date(item.dob.date).getDay()} /
                ${new Date(item.dob.date).getYear()}
                </p>
            </div>
        </div>

        // IMPORTANT: Below is only for exceeds tasks 
        <div class="modal-btn-container">
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        </div>
    </div>
    `
    // add html to DOM
    modalContainer.innerHTML = modal;
    // only animate if the window is opening mot paging between
    if(!isPaging){
        document.querySelector('.modal-container').classList.add('fadeIn')
    }
    // close button click event for modal event listener
    document.querySelector('#modal-close-btn').addEventListener('click', e =>  {
        // reset paging
        isPaging = false
        document.querySelector('.modal-container').classList.add('fadeOut')
        setTimeout( () => modalContainer.innerHTML = '', 450)
        
    })
    // next and previous buttons event listener
    document.querySelector('.modal-btn-container').addEventListener('click', e => nextPrevItem(e) )

}

// function to move back and forth through peeps in the modal
const nextPrevItem = (e) => {
    // do this for the next button
    if(e.target.id === 'modal-next'){
        // if we are not on the last person move forward
        // stops it from animating
        isPaging = true;
        if(currentItemIndex < searchList.length-1){
            displayModal(userData[searchList[currentItemIndex+1]], currentItemIndex+1 )           
        // if we are on the last person go to the first one.
        }else if(currentItemIndex >= searchList.length-1){
            displayModal(userData[searchList[0]], 0 ) 
        }
    // this is the previous button     
    }else if(e.target.id === 'modal-prev'){
        //if we are not on the first one back it up
        // stops it from animating
        isPaging = true;
        if(currentItemIndex > 0){
            displayModal(userData[searchList[currentItemIndex-1]], currentItemIndex-1 ) 
        //if we are on the first one go to the last one
        }else if(currentItemIndex === 0){
            displayModal(userData[searchList[searchList.length-1]], searchList.length ) 
        }   
    }
}

// dirty little function to grab an ID from the div
const getTargetID = (e) => {
    // set up var to return with value
    let itemID

    if( e.target.className.includes('container') ){
        // one layer deep finds it
        itemID = e.target.parentNode.id      
    }else if(e.target.className.includes('card-text') || 
        e.target.className.includes('card-name')||
        e.target.className.includes('card-img')){
            // 2 layers deeps finds it
            itemID = e.target.parentNode.parentNode.id 
    }else if(e.target.className === 'card'){
        // top layer finds it.
        itemID = e.target.id 
    }
    // give them the ID
    return itemID
}

// function to search the input against the list
const search = (name) => {
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

    if(searchList.length <= 0){
        // if dont have a match
       errorContainer.innerHTML = '<h3>No Matches</h3>'
    }else{
       // if we do
       errorContainer.innerHTML = ''
    }
    
 }

// event listener for clicking in people cards
galleryContainer.addEventListener('click', (e) => {
    // only click if its a card
    if( e.target.className.includes('card') ){
        // get the current ID from the id attribute
        currentItem = parseInt(getTargetID(e))
        
        searchList.map((item, index)=>{
            // find the currentitemindex by matchind the id to the searchlist index
            if(item === currentItem) currentItemIndex = index
        })
        // display the modal
        displayModal(userData[currentItem], currentItemIndex)    
    }
})

// lets start this party here by grabbing some data
fetchData('https://randomuser.me/api/?results=12&nat=us')
.then( data => {
    // populate the cards
    generateCardsHTML(data.results)
    // add the search bar
    addSearchBarHTML();
    // store the data so we can get to it later
    userData = data.results
    // add all items to the search array to initialize it
    userData.map((item, index)=>{ searchList.push(index)   })
} )
