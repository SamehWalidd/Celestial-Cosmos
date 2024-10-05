const url = 'https://data.nasa.gov/resource/b67r-rgxc.json';

export async function fetchLimitedData() {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const limitedData = data.slice(0, 50).map(item => item.object_name);
        console.log(limitedData);
        return limitedData;
    } catch (error) {
        console.error(error);
    }
}
