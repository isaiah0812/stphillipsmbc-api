import { Document } from "mongodb";

export interface PhotoForm extends Document {
  name?: string
  description?: string
  url: string
  cloud_id?: string
}

export interface CreatePhotoForm {
  name?: string
  description?: string
  source: URL | File | Blob | MediaSource
}

export interface UpdatePhotoForm {
  name?: string
  description?: string
}

export class Photo implements Document {
  name?: string
  description?: string
  url: string
  cloud_id?: string

  constructor(photo: PhotoForm) {
    const { name, description, url, cloud_id } = photo

    this.setName(name)
    this.setDescription(description)
    this.setUrl(url)
    this.setCloud_id(cloud_id)
  }

  update(photo: UpdatePhotoForm) {
    const { name, description } = photo;

    if (name) this.setName(name)
    if (description) this.setDescription(description)
  }

  static copy(photo: Photo) {
    return new Photo({...photo} as PhotoForm)
  }

  private setName(name: string | undefined) {
    this.name = name
  }

  private setDescription(description: string | undefined) {
    this.description = description
  }

  private setUrl(url: string) {
    this.url = url;
  }

  private setCloud_id(cloud_id?: string) {
    this.cloud_id = cloud_id;
  }
}