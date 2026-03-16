import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-runway-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./runway-panel.component.html",
})
export class RunwayPanelComponent {
  @Input({ required: true }) span!: number;
  @Input({ required: true }) estalvis!: number;
  @Input({ required: true }) costDiari!: number;
  @Input({ required: true }) runwayDays!: number | null;
  @Input({ required: true }) runwayMonths!: number;
  @Input({ required: true }) runwayYears!: number;
  @Input({ required: true }) endDate!: string;
  @Input({ required: true }) onEstalvisChange!: (value: number) => void;
  @Input({ required: true }) onCostDiariChange!: (value: number) => void;
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3, 4];
}
