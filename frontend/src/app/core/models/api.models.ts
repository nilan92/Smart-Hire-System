export interface ApiError {
  detail?: string | Array<{ msg?: string }>;
}

export interface ApiMessage {
  message: string;
}
