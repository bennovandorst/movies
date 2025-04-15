import TVSeriesCard from "./TVSeriesCard";

const TVSeriesList = ({ series }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {series.map((item) => (
                <TVSeriesCard key={item.id} series={item} />
            ))}
        </div>
    );
};

export default TVSeriesList; 