import { ServerResponseError, ErrorMessage, AppResponseError } from '../../types/AppResponse';

abstract class AppError {
  protected code: string;
  protected element: string;
  protected detail: string;

  constructor(error: ServerResponseError) {
    this.code = error.code;
    this.element = error.element || '';
    this.detail = error.detail || '';
  }

  getErrorDetail(): ServerResponseError {
    return {
      code: this.code,
      element: this.element,
      detail: this.detail,
    };
  }

  getResponseError(): AppResponseError {
    return {
      code: this.code,
      element: this.element,
      detail: this.detail,
      message: {
        title: this.getMessage().title,
        content: this.getMessage().content,
      },
    };
  }

  abstract getMessage(): ErrorMessage;
}

export default AppError;
