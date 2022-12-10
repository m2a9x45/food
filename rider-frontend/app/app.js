const API_URL = 'http://localhost:3001';
const batchHolder = document.querySelector('.batchHolder');
let authToken;

window.onload = async function() {
    // Check if the rider is has a token
    const token = localStorage.getItem('rtoken');
    if (token === null) {
        // Error no token, direct rider to login
        window.location.replace('../login');
        console.log('No token');
        return
    }

    console.log(token);
    authToken = token;

    try {
        const signupStatusRes = await getSignupStatus(authToken);
        console.log(signupStatusRes);
        handleSignupStatus(signupStatusRes.signup_status)
    } catch (error) {
        console.log(error);
    }

    try {
        const batches = await getBatches(authToken);
        console.log(batches);
        batches.forEach(batch => {
            displayBatch(batch);
        });
    } catch (error) {
        console.log(error);
    }

}

async function getSignupStatus(token) {
    try {
        const response = await fetch(`${API_URL}/shopper/signup/status`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

async function getBatches(token) {
    try {
        const response = await fetch(`${API_URL}/shopper/order/batches`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

function handleSignupStatus(status) {
    switch (status) {
        case "stripe":
            return window.location.replace('../signup/stripe/intro');
        case "stripe_awaiting":
            return window.location.replace('../signup/stripe/reauth');
        case "stripe_completed":
            return
    }
}

async function displayBatch(batch) {
    const batchDiv = document.createElement('div');

    switch (batch.company_name) {
        case "Morrisons":
            console.log("morrisons");
            batchDiv.setAttribute('class', 'batch morrison');
            break;
        case "ALDI":
            console.log("aldi");
            batchDiv.setAttribute('class', 'batch aldi');
            break;
    }

    const batchInfoDiv = document.createElement('div');
    batchInfoDiv.setAttribute('class', 'batchInfo')

    // Logo & Address
    const logoAndAddressDiv = document.createElement('div');
    logoAndAddressDiv.setAttribute('class', 'logoAndAddress');

    const logo = document.createElement('img');
    logo.setAttribute('src', `${API_URL}/storeLogo/${batch.logo}`);

    logoAndAddressDiv.appendChild(logo);

    const address = document.createElement('p');
    address.setAttribute('class', 'address');
    address.innerHTML = `<i class="fas fa-store"></i> ${batch.address}`;

    // const addressIcon = document.createElement('i');
    // addressIcon.setAttribute('class', 'fas fa-store');

    // address.appendChild(addressIcon);

    logoAndAddressDiv.appendChild(address);

    // Time & Item Number
    const time = document.createElement('p');
    const timeIcon = document.createElement('i');
    timeIcon.setAttribute('class', 'fas fa-clock');

    const deliveryTime = new Date(batch.delivery_time);
    time.innerText = deliveryTime.toLocaleTimeString("en-GB", {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: "h24"
      })

    time.appendChild(timeIcon);

    const itemCount = document.createElement('p');
    const itemCountIcon = document.createElement('i');
    itemCountIcon.setAttribute('class', 'fas fa-shopping-basket');
    itemCount.innerText = await getBatchItemCount(authToken, batch.order_id);

    itemCount.appendChild(itemCountIcon)

    batchInfoDiv.appendChild(logoAndAddressDiv);

    batchInfoDiv.appendChild(time);
    batchInfoDiv.appendChild(itemCount);

    // Create Button
    const buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('class', 'buttonDiv')
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-search"></i> View Batch';
    button.addEventListener('click', () => {
        window.location.href = `./batch/?batchID=${batch.order_id}`;
    });

    buttonDiv.appendChild(button);

    batchDiv.appendChild(batchInfoDiv);
    batchDiv.appendChild(buttonDiv);

    batchHolder.appendChild(batchDiv);

}

async function getBatchItemCount(token, orderID) {
    try {
        const response = await fetch(`${API_URL}/shopper/order/item-count/${orderID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const data = await response.json();
        return data.item_count;
    } catch (error) {
        console.error(error);
    }
}