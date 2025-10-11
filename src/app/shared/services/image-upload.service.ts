import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  API_MESSAGES,
  BASE_URL,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '../constants';
import { HttpClient } from '@angular/common/http';
import { APIBaseResponse } from '../types';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private httpClient: HttpClient = inject(HttpClient);
  private messageService: MessageService = inject(MessageService);
  private imageUploadUrl: string = BASE_URL.IMAGE_UPLOAD;

  uploadImage(file: File): Observable<string> {
    return this.httpClient
      .post<APIBaseResponse<{ image_url: string }>>(this.imageUploadUrl, file)
      .pipe(
        map((response) => {
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: API_MESSAGES.IMAGE.UPLOAD_SUCCESS,
          });
          return response.data.image_url;
        }),
        catchError(() => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.IMAGE.UPLOAD_ERROR,
          });
          return throwError(() => new Error(API_MESSAGES.IMAGE.UPLOAD_ERROR));
        }),
      );
  }

  deleteImage(imageUrl: string, suppressMessage?: boolean): Observable<boolean> {
    return this.httpClient
      .delete<void>(this.imageUploadUrl, {
        body: { image_url: imageUrl },
      })
      .pipe(
        map(() => {
          if (!suppressMessage) {
            this.messageService.add({
              severity: TOAST_TYPES.SUCCESS,
              summary: TOAST_SUMMARIES.SUCCESS,
              detail: API_MESSAGES.IMAGE.DELETE_SUCCESS,
            });
          }
          return true;
        }),
        catchError(() => {
          if (!suppressMessage) {
            this.messageService.add({
              severity: TOAST_TYPES.ERROR,
              summary: TOAST_SUMMARIES.ERROR,
              detail: API_MESSAGES.IMAGE.DELETE_ERROR,
            });
          }
          return throwError(() => new Error(API_MESSAGES.IMAGE.DELETE_ERROR));
        }),
      );
  }
}
