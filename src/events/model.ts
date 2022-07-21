import { Document } from "mongodb";
import { ValidationError } from "../utils/errorHandling";
import { isEmpty } from "../utils/utilFunctions";

export interface EventForm extends Document {
  name: string
  description: string
  startTime: Date
  endTime: Date
  location: string
}

export class Event implements Document {
  name: string
  description: string
  startTime: Date
  endTime: Date
  location: string

  constructor(event: EventForm) {
    const { name, description, startTime, endTime, location } = event

    this.setName(name)
    this.setDescription(description)
    this.setStartTime(startTime)
    this.setEndTime(endTime)
    this.setLocation(location)
  }

  update(event: EventForm): void {
    const { name, description, startTime, endTime, location } = event

    if (name) this.setName(name)
    if (description) this.setDescription(description)
    if (startTime) this.setStartTime(startTime)
    if (endTime) this.setEndTime(endTime)
    if (location) this.setLocation(location)
  }

  static copy(event: Event): Event {
    return new Event({...event} as EventForm)
  }

  private setName(name: string): void {
    if (isEmpty(name))
      throw new ValidationError("Null Event Name", "Event 'name' cannot be empty.")
    
    this.name = name
  }

  private setDescription(description: string): void {
    if (isEmpty(description))
      throw new ValidationError("Null Event Description", "Event 'description' cannot be empty.")
    
    this.description = description
  }

  private setStartTime(startTime: Date): void {
    if (isEmpty(startTime))
      throw new ValidationError("Null Event Start Time", "Event 'startTime' cannot be empty.")
      
    this.startTime = new Date(startTime)
    
    if(startTime.toString() === "Invalid Date")
      throw new ValidationError("Invalid Event Start Time", "Event 'startTime' is invalid.")
      
    if (!isEmpty(this.endTime) && this.endTime < startTime)
      throw new ValidationError("Event Start Time After End", "Event 'startTime' cannot be after event 'endTime'")
  }

  private setEndTime(endTime: Date): void {
    if (isEmpty(endTime))
      throw new ValidationError("Null Event End Time", "Event 'endTime' cannot be empty.")

    this.endTime = new Date(endTime)
    
    if(endTime.toString() === "Invalid Date")
      throw new ValidationError("Invalid Event Start Time", "Event 'endTime' is invalid.")
      
    if (!isEmpty(this.startTime) && endTime < this.startTime)
      throw new ValidationError("Event Start Time After End", "Event 'startTime' cannot be after event 'endTime'")
  }

  private setLocation(location: string): void {
    if (isEmpty(location))
      throw new ValidationError("Null Event Location", "Event 'location' cannot be empty")

    this.location = location
  }
}