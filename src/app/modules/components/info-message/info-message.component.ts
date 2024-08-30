import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-message',
  templateUrl: './info-message.component.html',
  styleUrl: './info-message.component.scss'
})
export class InfoMessageComponent implements OnInit {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'warning' = 'success';
  @Input() show = false;
  @Input() duration = 3000; // Tiempo en milisegundos

  constructor() { }

  ngOnInit(): void {
    if (this.show) {
      setTimeout(() => {
        this.show = false;
      }, this.duration);
    }

  }

  get messageClass() {
    return {
      'message-success': this.type === 'success',
      'message-error': this.type === 'error',
      'message-warning': this.type === 'warning',
      'message-hidden': !this.show,
    };
  }

}
