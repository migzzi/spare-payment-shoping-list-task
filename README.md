This project is my own implementation to **Spare Payment** task for FS developer position.
# Installation
    $ npm install

# Testing
    $ npm test

# Start
To run a development server

    $ npm start

To the production server  server

    $ npm run start:prod

# Notations and Conventions
each api endpoint will be specified in followin format.
$DESCRIPTION
$METHOD $URI
request:
$REQUSET_BODY_SCHEMA | **None**
response:
$RESPONSE_BODY_SCHEMA

		
for example:-
**Listing all toys.**

    POST /api/toys
    request:
    {
        name: string,
        desc: string,
        count: number
    }
    response:
    {
	    success: boolean,
	    message: string
	}
for custom types I will reference the definition of that type by prefixing it with **#** symbol. The actual defenition will be added before the APIs.

If a property name is suffixed with **?** symbol then it means it's optional. it might or might not be present.

URI parameters will be put between curly brakets **{}**.


## Products 

### Model Definitions
	#Product {
		id: number,
		name: string,
		quantity: number,
		price: number
	}
	
### APIs

**Listing products**

    GET /api/products
    request:
	None
    response:
    {
	    products: #Product[],
	    total: number
	}


**Adding a product**

    POST /api/products
    request:
	{
		name: string,
		quantity: number,
		price: number
	}
    response:
    {
	    success: boolean,
	    data?: #Product,
	    message?: string,
	    errors?: any[]
	}

**Updating a product**

    PUT /api/product/{id}
    request:
	{
		name?: string,
		quantity?: number,
		price?: number
	}
    response:
    {
	    success: boolean,
	    data?: #Product,
	    message?: string,
	    errors?: any[]
	}
	
**Deleting a product**

    DELETE /api/product/{id}
    request:
    None
    response:
    {
	    success: boolean,
	    message: string
	}

## Shoping List 

### Model Definitions
	#ShopintListItem {
		id: number,
		product: #Product,
		quantity: number,
	}
	
### APIs

**Listing shoping list items**

    GET /api/shoping-list
    request:
	None
    response:
    {
	    shopingList: #ShopintListItem[],
	    total: number
	}


**Adding an item to the shoping list**

    PUT /api/shoping-list/item/add
    request:
	{
		quantity: number,
		product_id: number
	}
    response:
    {
	    success: boolean,
	    message?: string
	}

**Removing an item frm the shoping list**

    DELETE /api/product/{id}
    request:
	None
    response:
    {
	    success: boolean,
	    message?: string,
	    errors?: any[]
	}
	




