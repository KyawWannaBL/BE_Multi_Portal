export interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  senderName: string;
}

export const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'BRT-1001-YGN',
    status: 'In Transit',
    receiverName: 'Aung Ko Ko',
    receiverAddress: 'No. 45, Pyay Road',
    receiverCity: 'Yangon',
    senderName: 'Britium Central'
  },
  {
    id: '2',
    trackingNumber: 'BRT-2002-MDY',
    status: 'Pending',
    receiverName: 'Ma Su',
    receiverAddress: '73rd Street, Chan Aye Thar Zan',
    receiverCity: 'Mandalay',
    senderName: 'Merchant Hub'
  }
];