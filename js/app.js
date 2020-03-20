const searchContainer = document.querySelector('.search-container')
const galleryContainer = document.querySelector('.gallery')
const modalContainer = document.querySelector('#modal')
const errorContainer = document.querySelector('.error-container')

let isPaging = false
let userData = null
let currentItemIndex 
let searchList = []

// function to get and check status of data
const fetchData = (url) => {
    return fetch(url)
            .then(checkStatus)
            .then(res=>res.json())
            .catch(error=>console.log('oops', error))
}

const checkStatus = (response) => {
    if(response.ok){
        // if we are all ok resolve
        return Promise.resolve(response)
    }else{
        // if not return an e3rror
        return Promise.reject(new Error(response.statusText))
    }
}

const addSearchBarHTML = () => {
    return  `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>
    `
}

const initSearch = () => {

    document.querySelector('#search-submit').addEventListener('click', (e)=>{
        e.preventDefault()
        const searchInput = document.querySelector('input').value
        search(searchInput)
    })
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

    return html

}

// function to display the lightbox with navigation arrows
const displayModal = (item, index) => {
    currentItemIndex = parseInt(index)
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
    modalContainer.innerHTML = modal
    if(!isPaging){
        document.querySelector('.modal-container').classList.add('fadeIn')
    }
    document.querySelector('#modal-close-btn').addEventListener('click', e =>  {
        // reset paging
        isPaging = false
        document.querySelector('.modal-container').classList.add('fadeOut')
        setTimeout( () => modalContainer.innerHTML = '', 450)
        
    })
    // next and previous buttons event listener
    document.querySelector('.modal-btn-container').addEventListener('click', e => nextPrevItem(e) )

}

const nextPrevItem = (e) => {
    if(e.target.id === 'modal-next'){
        isPaging = true
        if(currentItemIndex < searchList.length-1){
            displayModal(userData[searchList[currentItemIndex+1]], currentItemIndex+1 )           
        // if we are on the last person go to the first one.
        }else if(currentItemIndex >= searchList.length-1){
            displayModal(userData[searchList[0]], 0 ) 
        }
    }else if(e.target.id === 'modal-prev'){
        //if we are not on the first one back it up
        isPaging = true
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

const search = (name) => {
    // turn them all off
    document.querySelectorAll('.card').forEach(card => card.style.display = 'none')
    // reset the array to store matches in
    searchList = []
    //lets loop through it and see what matches
    for(let i = 0; i<userData.length; i++){
       const firstName = userData[i].name.first.toLowerCase()
       const lastName = userData[i].name.last.toLowerCase()
       if( firstName.includes(name.toLowerCase()) || lastName.includes(name.toLowerCase()) ){
          searchList.push(i)
          searchList.map( id => document.getElementById(id).style.display = 'flex' )
       }        
    }

    if(searchList.length <= 0){
       errorContainer.innerHTML = '<h3>No Matches</h3>'
    }else{
       errorContainer.innerHTML = ''
    }
    
 }

// event listener for clicking in people cards
galleryContainer.addEventListener('click', (e) => {
    if( e.target.className.includes('card') ){
        currentItem = parseInt(getTargetID(e))
        
        searchList.map((item, index)=>{
            if(item === currentItem) currentItemIndex = index
        })
        displayModal(userData[currentItem], currentItemIndex)    
    }
})

// lets start this party here by grabbing some data
fetchData('https://randomuser.me/api/?results=120&nat=us')
.then( data => {
    galleryContainer.innerHTML = generateCardsHTML(data.results)
    searchContainer.innerHTML = addSearchBarHTML()
    initSearch()
    userData = data.results
    userData.map((item, index)=>{ searchList.push(index)   })
} )
