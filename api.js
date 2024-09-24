const url = 'https://data.nasa.gov/resource/b67r-rgxc.json';

export async function fetchLimitedData()
{
    try
    {
        const respnse = await fetch(url);

        if(!respnse.ok)
        {
            throw new Error('Failed to fetch data');
        }

        const data = await respnse.json();
        const limitedData = data.slice(0, 10);
        console.log(limitedData);
        return limitedData;
    }
    catch(error)
    {
        console.error(error);
    }
}