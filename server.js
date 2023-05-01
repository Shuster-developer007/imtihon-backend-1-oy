let http = require("http")
let fs = require("fs")
let crypto = require("crypto")
const { read, write } = require("./utils/model")
let Express = require("./lib/express")


let PORT = process.env.PORT ?? 5005

function httpServer(req, res) {
    let app = new Express(req, res)

    // Products
    app.get("/products", (req, res) => {
        try {
            const products = read("product")
            const subCategories = read("subCategories")
            const { category_id, sub_category_id, model } = req.query
            if (sub_category_id && model) {
                const product = products.filter(item => item.model == model && item.sub_category_id == sub_category_id,)
                return res.json(201, product)
            }
            if (category_id) {
                const product = subCategories.filter(item => item.category_id == category_id)
                return res.json(201, product)
            }
            if (sub_category_id) {
                const product = products.filter(item => item.sub_category_id == sub_category_id)
                return res.json(201, product)
            }
            if (model) {
                const product = products.filter(item => item.model == model)
                return res.json(201, product)
            }
            res.json(200, [])
        } catch (error) {
            res.json(400, { succes: 400, message: error.message })
        }
    })
    app.post("/products", async (req, res) => {
        try {
            let { sub_category_id, product_name, price, color, model } = await req.body
            const products = read("product")
            if(!(sub_category_id && product_name && price && color && model)) {
                throw new Error("fill up completely")
            }
            const product = { product_id: products.at(-1)?.product_id + 1 || 1, sub_category_id, product_name, price, color, model }
            products.push(product)
            write("product", products)
            res.json(201, { status: 201, message: "Created product" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })
        }
    })
    app.put("/products", async (req, res) => {
        try {
            let { product_id, product_name, price } = await req.body
            const products = read("product")
            const product = products.find(item => item.product_id == product_id)
            product.product_id = product_id || product.id
            product.product_name = product_name || product.product_name
            product.price = price || product.price
            write("product", products)
            res.json(201, { status: 201, message: "rennamed product" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })

        }
    })
    app.delete("/products", async (req, res) => {
        try {
            const { product_id } = await req.body
            const products = read("product")
            const productIndex = products.findIndex(item => item.product_id == product_id)
            if (productIndex == -1) {
                throw new Error("product_id not found")
            }
            products.splice(productIndex, 1)
            write("product", products)
            res.json(204, { status: 204, message: "deleted product" })

        } catch (error) {
            res.json(400, { status: 400, message: error.message })

        }
    })

    // Categories
    app.get("/categories", (req, res) => {
        const categories = read("categories")
        const subCategories = read("subCategories")
        categories.map(categories => {
            categories.subCategory = subCategories.filter(item => item.category_id == categories.category_id && delete item.category_id)

        })
        res.json(200, categories)
    })
    app.post("/categories", async (req, res) => {
        try {
            let { category_name } = await req.body
            let categories = read("categories")
            const newcotegoryName = { category_id: categories.at(-1)?.category_id + 1 || 1, category_name }
            categories.push(newcotegoryName)
            write("categories", categories)
            res.json(201, { status: 201, message: "created new category" })
        } catch (error) {
            console.log(error);
        }

    })
    app.put("/categories", async (req, res) => {
        try {
            const { category_id, category_name } = await req.body
            const categories = read("categories")
            const category = categories.find(item => item.category_id == category_id)
            category.category_name = category_name || category_name
            write("categories", categories)
            res.json(201, { status: 201, message: "category rennamed" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })

        }

    })
    app.delete("/categories", async (req, res) => {
        try {
            const { category_id } = await req.body
            const categories = read("categories")
            const categoryIndex = categories.findIndex(item => item.category_id == category_id)
            if (categoryIndex == -1) {
                throw new Error("categry_id not found")
            }
            categories.splice(categoryIndex, 1)
            write("categories", categories)
            res.json(204, { status: 204, message: "category deleted" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })
        }
    })


    // Subcategories
    app.get("/subcategories", (req, res) => {
        const subCategories = read("subCategories")
        const product = read("product")
        subCategories.map(subcategory => {
            subcategory.products = product.filter(item => item.sub_category_id == subcategory.sub_category_id && delete item.sub_category_id)
            delete subcategory.category_id;

        })

        res.json(200, subCategories)
    })
    app.post("/subcategories", async (req, res) => {
        try {
            const { category_id, sub_category_name } = await req.body
            const subcategories = read("subCategories")
            if(!(category_id && sub_category_name )) {
                throw new Error("fill up completely")
            }
            const newsubcotegoryName = { sub_category_id: subcategories.at(-1)?.sub_category_id + 1 || 1, category_id, sub_category_name }
            subcategories.push(newsubcotegoryName)
            write("subCategories", subcategories)
            res.json(201, { status: 201, message: "created subCategory" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })
        }
    })
    app.put("/subcategories", async (req, res) => {
        try {
            const { sub_category_name, sub_category_id } = await req.body
            const subcategories = read("subCategories")
            const subcategory = subcategories.find(item => item.sub_category_id == sub_category_id)
            subcategory.sub_category_name = sub_category_name || sub_category_name
            write("subCategories", subcategories)
            res.json(201, { status: 201, message: "subcategory rennamed" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })

        }
    })
    app.delete("/subcategories", async (req, res) => {
        try {
            const { sub_category_id } = await req.body
            const subcategories = read("subCategories")
            const sbcategoriesIndex = subcategories.findIndex(item => item.sub_category_id == sub_category_id)
            if (sbcategoriesIndex == -1) {
                throw new Error("sub_category_id not found")
            }
            subcategories.splice(sbcategoriesIndex, 1)
            write("subCategories", subcategories)
            res.json(400, { status: 204, message: "deleted subcategories" })

        } catch (error) {
            res.json(400, { status: 400, message: error.message })
        }
    })


    app.post("/sigin", async (req, res) => {
        try {
            let { username, password } = await req.body
            const admin = read("admin")
            if(!(username && password )) {
                throw new Error("fill up completely")
            }
            password = crypto.createHash("sha256").update(password).digest("hex")
            let useradmin = admin.find(item => item.password == password && item.username == username)
            if (!useradmin) {
                throw new Error("wrong user name on password")
            }
            res.json(201, { status: 201, message: "ok" })
        } catch (error) {
            res.json(400, { status: 400, message: error.message })
        }
    })


}

http.createServer(httpServer).listen(PORT, () => console.log("server running"))

