import React, {useState} from "react";

const List = ({events}) => {

    //console.log(events.isLoggedIn)
    // Events to show filters
    let currentDate = new Date().toJSON().slice(0, 10);
    //console.log(currentDate);
    const [eventStartDate, setEventStartDate] = useState(currentDate)
    const [eventEndDate, setEventEndDate] = useState('2027-03-06')
    const [eventType, setEventType] = useState('Kaikki')

    const eventsToShow = () => {
       return events.filter(event=> event.Date >= eventStartDate
            && event.Date <= eventEndDate && (eventType === 'Kaikki' ? true : (event.Type === eventType) )  )
    }

    // Form handlers
    const handleEventStartDateChange = (eventStartDate) => {
        console.log(eventStartDate.target.value)
        setEventStartDate(eventStartDate.target.value)
    }
    const handleEventEndDateChange = (eventEndDate) => {
        console.log(eventEndDate.target.value)
        setEventEndDate(eventEndDate.target.value)
    }
    const handleEventTypeChange = (eventType) => {
        console.log(eventType.target.value)
        setEventType(eventType.target.value)
    }
    

    return(
        <div className="container">

            <form>
                <div className="mb-3 mt-3">
                   
                    <label htmlFor="date" className="form-label">Tapahtuman tyyppi:</label>
                    <select name="eventType"
                            value ={eventType}
                            onChange={handleEventTypeChange}
                            className="form-control">
                        <option>Kaikki</option>
                        <option>Musiikki</option>
                        <option>Urheilu</option>

                    </select>
                </div>
                <div className="mb-3 mt-3">
                    <label htmlFor="date" className="form-label">Alkupäivämäärä:</label>
                    <input type="date"
                           value ={eventStartDate}
                           onChange={handleEventStartDateChange}
                           className="form-control"/>
                </div>
                <div className="mb-3 mt-3">
                    <label htmlFor="endDate" className="form-label">Loppupäivämäärä:</label>
                    <input type="date"
                           value ={eventEndDate}
                           onChange={handleEventEndDateChange}
                           className="form-control"/>
                </div>

            </form>




            <ul>
                {eventsToShow().map(event =>
                    <li key={event.Event_id}>
                        {event.Date} {event.Type}: {event.Name} <br/>{event.Location_name}  {event.Street_address} {event.City} {event.Zip} {event.Country}
                    </li>
                )}
            </ul>

        </div>
    )
}

export default List