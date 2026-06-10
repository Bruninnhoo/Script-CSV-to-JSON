import Papa from 'papaparse'
import fs from 'fs'

const csvPath = './products.csv'
const jsonPath = './products_output.json'

// Keys to create sub-objects
const fiscalKey = ['ncm', 'cfop', 'icms_origem', 'icms_csosn_or_cst']
const inventoryKey = ['tracks_inventory', 'current_stock', 'min_stock']
const behaviorKey = ['is_weighed', 'sold_in_fractions', 'allows_discount', 'allows_price_override', 'is_food', 'is_active']
const predefinedKey = ['predefined_observations']
const metadataKey = ['legacy_id']

try {

    const csvString = fs.readFileSync(csvPath, 'utf8')

    Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {

            const validProducts = []
            const productWithErrors = []

            results.data.forEach((item, index) => {

                // Verify invalid products by name
                if (!item.name || item.name.trim() === '') {
                    productWithErrors.push({
                        row: index + 2,
                        field: 'name',
                        message: 'name is required.'
                    })
                    return
                }

                // Verify invalid products by sku
                if (!item.sku || item.sku.trim() === '') {
                    productWithErrors.push({
                        row: index + 2,
                        field: 'sku',
                        message: 'sku is required.'
                    })
                    return
                }

                // Verify if exist the sku in array validProducts
                const productExists = validProducts.find(product => product.sku === item.sku)
                if (productExists) {
                    productWithErrors.push({
                        row: index + 2,
                        field: 'sku',
                        message: 'sku already exists.'
                    })
                    return
                }

                // Verify NCM
                const ncm = item.ncm.trim()
                if (ncm.length !== 8) {
                    productWithErrors.push({
                        row: index + 2,
                        field: 'ncm',
                        message: 'ncm must be 8 digits.'
                    })
                    return
                }


                // Normalize sale price and cost price
                const priceVerify = Number(item.sale_price.replace(/\D/g, ''))
                const costPriceVerify = Number(item.cost_price.replace(/\D/g, ''))

                if (isNaN(priceVerify)) {
                    productWithErrors.push({
                        row: index + 2,
                        field: 'sale_price',
                        message: 'sale_price must be a number.'
                    })
                    return
                }

                if (isNaN(costPriceVerify)) {
                    productWithErrors.push({
                        row: index + 2,
                        field: 'cost_price',
                        message: 'cost_price must be a number.'
                    })
                    return
                }

                item.sale_price = priceVerify
                item.cost_price = costPriceVerify

                const unitNormalizer = () => {
                    const unit = item.unit_of_measure.trim().toLowerCase()

                    if (unit == 'unidade' || unit == 'un' || unit == 'unid' || unit == 'porcao') {
                        return item.unit_of_measure = 'unit'
                    }

                    if (unit == 'quilo' || unit == 'kg') {
                        return item.unit_of_measure = 'kg'
                    }

                    return unit
                }

                unitNormalizer()

                const booleanNormalizer = (value) => {
                    const boolean = value

                    if (boolean == 'sim' || boolean == 'Sim' || boolean == 'SIM' || boolean == '1') {
                        return true
                    }

                    if (boolean == 'nao' || boolean == 'Nao' || boolean == 'NAO' || boolean == "0") {
                        return false
                    }
                }


                // Create product 
                const product = {}

                // Add all keys except sub-objects
                Object.keys(item).forEach(key => {
                    if (!fiscalKey.includes(key) && !inventoryKey.includes(key) && !behaviorKey.includes(key) && !predefinedKey.includes(key) && !metadataKey.includes(key)) {
                        product[key] = item[key]
                    }
                })

                // Info in sub-objects
                product.fiscal = {}
                product.inventory = {}
                product.behavior = {}
                product.predefined_observations = []
                product.metadata = {}

                Object.keys(item).forEach(key => {
                    if (fiscalKey.includes(key)) {
                        product.fiscal[key] = item[key]
                    }
                    if (inventoryKey.includes(key)) {
                        const booleanVerify = booleanNormalizer(item[key])
                        if (booleanVerify !== undefined && item[key] == item.tracks_inventory) {
                            product.inventory[key] = booleanVerify
                        } else {
                            product.inventory[key] = item[key]
                        }
                    }
                    if (behaviorKey.includes(key)) {
                        const booleanVerify = booleanNormalizer(item[key])
                        if (booleanVerify !== undefined) {
                            product.behavior[key] = booleanVerify
                        } else {
                            product.behavior[key] = item[key]
                        }
                    }
                    if (predefinedKey.includes(key)) {
                        product.predefined_observations.push(item[key])
                    }
                    if (metadataKey.includes(key)) {
                        product.metadata[key] = item[key]
                    }
                })

                validProducts.push(product)
            })

            // Creating final object
            const finalResult = {
                products: validProducts,
                errors: productWithErrors
            }

            fs.writeFileSync(jsonPath, JSON.stringify(finalResult, null, 2), 'utf8')
        }
    })

} catch (err) {
    console.log(err)
}