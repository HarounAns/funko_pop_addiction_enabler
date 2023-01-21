const fs = require('fs');
const axios = require('axios');
const funkos = require('../funkoSourceOfTruth.json');
const newFunkos = [...funkos];

const main = async () => {
    const missingMatches = [];
    const errorFunkos = [];
    for (const funko of newFunkos) {
        const { name, number } = funko;
        if (!name) {
            console.error(`Invalid name ${name}, ${number}`);
            errorFunkos.push({ name, number });
            continue;
        }

        try {
            const { data: { data } } = await axios.get(`https://www.hobbydb.com/api/catalog_items?filters=%7B%22q%22:%7B%220%22:%22${name.split(' ').join('+')}%22%7D,%22in_collection%22:%22all%22,%22in_wishlist%22:%22all%22,%22on_sale%22:%22all%22,%22brand%22:%22380%22,%22series%22:%2230215%22%7D&from_index=true&include_cit=true&include_count=false&include_last_page=true&include_main_images=true&market_id=poppriceguide&order=%7B%22name%22:%22created_at%22,%22sort%22:%22desc%22%7D&page=1&per=6&serializer=CatalogItemPudbSerializer&subvariants=true`);
            const match = data.find(({ attributes: { name: _name } }) => _name === name);
            if (!match) {
                console.error(`Couldn't find match for ${name}, ${number}`);
                missingMatches.push({ name, number });
                continue;
            }
            const { attributes: { images: { main_photo_url } } } = match;
            console.log({ name, main_photo_url });
            funko.image = main_photo_url;
        } catch (error) {
            console.error(`Error for ${name}, ${number}`, error);
            errorFunkos.push({ name, number });
        }
    }


    console.log('Missing matches for following funkos', missingMatches);
    console.log('Error for following funkos', errorFunkos);
    console.log(newFunkos);
    const filename = `updatedFunkoSourceOfTruth-${new Date().toISOString()}.json`;
    fs.writeFileSync(filename, JSON.stringify(newFunkos, '', 2));
    console.log(`Wrote file to ${filename}`);
}

main();