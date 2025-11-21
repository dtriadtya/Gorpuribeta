declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: { left: number; right: number };
    theme?: string;
    styles?: {
      fontSize?: number;
      cellPadding?: { top: number; right: number; bottom: number; left: number };
      valign?: string;
      lineColor?: number[];
      lineWidth?: number;
      textColor?: number[];
      fontStyle?: string;
    };
    headStyles?: {
      fontStyle?: string;
      halign?: string;
      lineWidth?: number;
      textColor?: number[];
      fillColor?: number[];
    };
    columnStyles?: {
      [key: number]: {
        halign?: string;
        cellWidth?: number;
      };
    };
    didParseCell?: (data: { row: { index: number }; cell: { styles: any } }) => void;
  }

  interface jsPDFWithAutoTable extends jsPDF {
    autoTable(options: UserOptions): void;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
}