# new transactions table
the idea is to combine all transactions into a single table, rather than having separate tables 
for sales, purchases, transfers, etc

proposed structure:
## transactions table:
id - bigint
code - uuid
type - string - should link to a transaction type at point of creation. can be a sale, purchase, expiry, etc. 
type_stock_effect - subtract, add, neutral. this will be defined for each transaction type. for sales, it'll be subtract. for purchases, add. for expiries, subtract, etc
client_id - int linking to the clients table. the clients table will be a composite of vendors and customers table currently in use
client_name - clients details should be historical and not change with future updates
client_contact - string
client_address - string
created_by - int
user_name - the name of the user who created it. for brevity
created_on - timestamp
payments- linked to the payments table

## transaction_details
id - bigint
transaction_code - uuid
product - the id of the product. this is only for linking to products for searching, reports, etc
product_name - again, the product details should be historical
price - double
cost_price - double
quantity - double
expiry - date
batch_number: string
label: string
unit: string

## transaction_types
id - bigint
name - string, unique
stock_effect - subtract, add, neutral
payment_required - yes, no
created_by
created_on

permissions must be generated for each transaction type when managing user roles

## payments
id
transaction_code
payment_method
amount
transaction_id

there will be a single transaction api and ui.
the type will simply be used to filter the type of transaction desired
there will be no editing of transactions. if needed, do a return
for each transaction, there will be details[], payments[]
