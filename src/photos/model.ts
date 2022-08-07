import { Document } from "mongodb";
import { ValidationError } from "src/utils/errorHandling";

export interface PhotoForm extends Document {
  name?: string
  description?: string
  url: URL
}

export class Photo implements Document {
  name?: string
  description?: string
  url: URL

  constructor(photo: PhotoForm) {
    const { name, description, url } = photo

    this.setName(name)
    this.setDescription(description)
    this.setUrl(url)
  }

  private setName(name: string | undefined) {
    this.name = name
  }

  private setDescription(description: string | undefined) {
    this.description = description
  }

  private setUrl(url: URL) {
    try {
      this.url = new URL(url)
    } catch(e: any) {
      if (e instanceof TypeError) {
        throw new ValidationError("Invalid Photo URL", "Photo 'url' must be a valid URL.")
      }
    }
  }
}