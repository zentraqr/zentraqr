import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Move,
  Square,
  Circle,
  RectangleHorizontal,
  QrCode,
  Download,
  Layers,
  PenTool,
  MousePointer,
  Save,
  X,
  ChevronDown,
  Coffee,
  Flower2,
  DoorOpen,
  Building,
  Grid3X3,
  RotateCw,
  Copy,
  Eye,
  Pencil,
  Check,
  Ruler,
  MoreVertical
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Colors
const colors = {
  primary: '#1E2A4A',
  secondary: '#3B5998',
  accent: '#1a2342',
  dark: '#1E2A4A',
  light: '#F8FAFC',
  white: '#FFFFFF',
  gray: '#64748B',
  border: '#E2E8F0',
  green: '#10B981',
  red: '#EF4444',
};

// Default zones
const defaultZones = [
  { name: 'Piso 1', display_order: 0 },
  { name: 'Piso 2', display_order: 1 },
  { name: 'Esplanada', display_order: 2 },
];

// Table shapes config
const tableShapes = [
  { id: 'square', icon: Square, label: 'Quadrada' },
  { id: 'round', icon: Circle, label: 'Redonda' },
  { id: 'rectangle', icon: RectangleHorizontal, label: 'Retangular' },
];

// Element types config
const elementTypes = [
  { id: 'counter', icon: RectangleHorizontal, label: 'Balcão', defaultSize: { width: 150, height: 40 } },
  { id: 'bar', icon: Coffee, label: 'Bar', defaultSize: { width: 120, height: 60 } },
  { id: 'plant', icon: Flower2, label: 'Planta', defaultSize: { width: 30, height: 30 } },
  { id: 'door', icon: DoorOpen, label: 'Porta', defaultSize: { width: 60, height: 10 } },
  { id: 'stairs', icon: Building, label: 'Escadas', defaultSize: { width: 80, height: 80 } },
  { id: 'wc', icon: DoorOpen, label: 'WC', defaultSize: { width: 60, height: 60 } },
];

// Wall types config
const wallTypes = [
  { id: 'wall', label: 'Parede', thickness: 8, color: '#1E2A4A' },
  { id: 'divider', label: 'Divisória', thickness: 4, color: '#94A3B8' },
  { id: 'window', label: 'Janela', thickness: 6, color: '#3B82F6' },
];

// Pre-made room shapes
const roomShapes = [
  { id: 'square', label: 'Quadrado', icon: Square, defaultWidth: 200, defaultHeight: 200 },
  { id: 'rectangle', label: 'Retangular', icon: RectangleHorizontal, defaultWidth: 300, defaultHeight: 200 },
  { id: 'round', label: 'Redondo', icon: Circle, defaultWidth: 200, defaultHeight: 200 },
];

const FloorPlanPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  
  // State
  const [zones, setZones] = useState([]);
  const [activeZone, setActiveZone] = useState(null);
  const [tables, setTables] = useState([]);
  const [walls, setWalls] = useState([]);
  const [elements, setElements] = useState([]);
  
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'table'|'wall'|'element', id: string }
  const [tool, setTool] = useState('select'); // select, wall, element
  const [wallType, setWallType] = useState('wall');
  const [elementType, setElementType] = useState('counter');
  const [tableShape, setTableShape] = useState('square');
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [wallStart, setWallStart] = useState(null);
  const [tempWallEnd, setTempWallEnd] = useState(null);
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDimensions, setRoomDimensions] = useState({ width: 200, height: 200 });
  const [rooms, setRooms] = useState([]); // Pre-made room shapes
  const [selectedRoomItem, setSelectedRoomItem] = useState(null); // Selected room for editing
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const [zoneMenuOpen, setZoneMenuOpen] = useState(null); // Zone ID for open menu

  // Translations
  const t = {
    pt: {
      title: 'Plantas & Salas',
      zones: 'Zonas',
      addZone: 'Adicionar Zona',
      tables: 'Mesas',
      addTable: 'Adicionar Mesa',
      tools: 'Ferramentas',
      select: 'Selecionar',
      drawWall: 'Desenhar Parede',
      addElement: 'Adicionar Elemento',
      wallTypes: 'Tipo de Parede',
      elements: 'Elementos',
      tableShape: 'Forma da Mesa',
      save: 'Guardar',
      saving: 'A guardar...',
      delete: 'Apagar',
      viewQR: 'Ver QR Code',
      downloadQR: 'Download QR',
      tableNumber: 'Mesa',
      capacity: 'Lugares',
      noZones: 'Crie uma zona para começar',
      createDefaultZones: 'Criar zonas padrão',
      zoneName: 'Nome da zona',
      cancel: 'Cancelar',
      create: 'Criar',
      clickToPlace: 'Clique no canvas para colocar',
      dragToMove: 'Arraste para mover',
      clickTwiceForWall: 'Clique para iniciar e terminar a parede',
      rooms: 'Plantas Pré-feitas',
      addRoom: 'Adicionar Planta',
      roomWidth: 'Largura (cm)',
      roomHeight: 'Altura (cm)',
      deleteZone: 'Eliminar Zona',
      editRoom: 'Editar Planta',
      dragToResize: 'Arraste os cantos para redimensionar',
    },
    en: {
      title: 'Floor Plans',
      zones: 'Zones',
      addZone: 'Add Zone',
      tables: 'Tables',
      addTable: 'Add Table',
      tools: 'Tools',
      select: 'Select',
      drawWall: 'Draw Wall',
      addElement: 'Add Element',
      wallTypes: 'Wall Type',
      elements: 'Elements',
      tableShape: 'Table Shape',
      save: 'Save',
      saving: 'Saving...',
      delete: 'Delete',
      viewQR: 'View QR Code',
      downloadQR: 'Download QR',
      tableNumber: 'Table',
      capacity: 'Seats',
      noZones: 'Create a zone to start',
      createDefaultZones: 'Create default zones',
      zoneName: 'Zone name',
      cancel: 'Cancel',
      create: 'Create',
      clickToPlace: 'Click on canvas to place',
      dragToMove: 'Drag to move',
      clickTwiceForWall: 'Click to start and end the wall',
      rooms: 'Pre-made Rooms',
      addRoom: 'Add Room',
      roomWidth: 'Width (cm)',
      roomHeight: 'Height (cm)',
      deleteZone: 'Delete Zone',
      editRoom: 'Edit Room',
      dragToResize: 'Drag corners to resize',
    }
  };
  const txt = t[language] || t.pt;

  // Fetch zones
  const fetchZones = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const response = await fetch(`${API_URL}/api/floor-zones/restaurant/${user.restaurant_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setZones(data);
        if (data.length > 0 && !activeZone) {
          setActiveZone(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  }, [user?.restaurant_id, token, activeZone]);

  // Fetch floor plan data for active zone
  const fetchFloorPlanData = useCallback(async () => {
    if (!activeZone?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/floor-plan/zone/${activeZone.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
        setWalls(data.walls || []);
        setElements(data.elements || []);
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching floor plan:', error);
    }
    setLoading(false);
  }, [activeZone?.id, token]);

  // Fetch all tables (including those without zone)
  const fetchAllTables = useCallback(async () => {
    if (!user?.restaurant_id) return;
    try {
      const response = await fetch(`${API_URL}/api/floor-plan/restaurant/${user.restaurant_id}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter tables without zone or in current zone
        const zoneTables = data.filter(t => !t.zone_id || t.zone_id === activeZone?.id);
        setTables(zoneTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  }, [user?.restaurant_id, token, activeZone?.id]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    if (activeZone) {
      fetchFloorPlanData();
    }
  }, [activeZone, fetchFloorPlanData]);

  // Create default zones
  const createDefaultZones = async () => {
    for (const zone of defaultZones) {
      try {
        await fetch(`${API_URL}/api/floor-zones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            restaurant_id: user.restaurant_id,
            ...zone
          })
        });
      } catch (error) {
        console.error('Error creating zone:', error);
      }
    }
    fetchZones();
  };

  // Create new zone
  const createZone = async () => {
    if (!newZoneName.trim()) return;
    try {
      await fetch(`${API_URL}/api/floor-zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurant_id: user.restaurant_id,
          name: newZoneName,
          display_order: zones.length
        })
      });
      setNewZoneName('');
      setShowZoneModal(false);
      fetchZones();
    } catch (error) {
      console.error('Error creating zone:', error);
    }
  };

  // Delete zone
  const deleteZone = async (zoneId) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta zona?')) return;
    try {
      await fetch(`${API_URL}/api/floor-zones/${zoneId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeZone?.id === zoneId) {
        setActiveZone(null);
      }
      setZoneMenuOpen(null);
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  // Add pre-made room
  const addRoom = async () => {
    if (!activeZone || !selectedRoom) return;
    const roomConfig = roomShapes.find(r => r.id === selectedRoom);
    try {
      const response = await fetch(`${API_URL}/api/floor-rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zone_id: activeZone.id,
          restaurant_id: user.restaurant_id,
          shape: selectedRoom,
          position_x: 100,
          position_y: 100,
          width: roomDimensions.width,
          height: roomDimensions.height,
          label: roomConfig?.label || ''
        })
      });
      if (response.ok) {
        const result = await response.json();
        setRooms([...rooms, {
          id: result.id,
          shape: selectedRoom,
          position_x: 100,
          position_y: 100,
          width: roomDimensions.width,
          height: roomDimensions.height,
          label: roomConfig?.label || ''
        }]);
        setShowRoomModal(false);
        setSelectedRoom(null);
        setRoomDimensions({ width: 200, height: 200 });
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Update room dimensions/position
  const updateRoom = async (roomId, updates) => {
    try {
      await fetch(`${API_URL}/api/floor-rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    try {
      await fetch(`${API_URL}/api/floor-rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(rooms.filter(r => r.id !== roomId));
      setSelectedRoomItem(null);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Add new table
  const addTable = async () => {
    if (!activeZone) return;
    const tableNumber = (tables.length + 1).toString();
    const newTable = {
      restaurant_id: user.restaurant_id,
      table_number: tableNumber,
      capacity: 4,
      zone_id: activeZone.id,
      position_x: 100 + Math.random() * 200,
      position_y: 100 + Math.random() * 200,
      width: 60,
      height: tableShape === 'rectangle' ? 40 : 60,
      shape: tableShape
    };
    
    try {
      const response = await fetch(`${API_URL}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTable)
      });
      if (response.ok) {
        const table = await response.json();
        setTables([...tables, table]);
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  // Update table position
  const updateTablePosition = async (tableId, x, y) => {
    try {
      await fetch(`${API_URL}/api/tables/${tableId}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          position_x: x,
          position_y: y,
          zone_id: activeZone?.id
        })
      });
    } catch (error) {
      console.error('Error updating table position:', error);
    }
  };

  // Delete table
  const deleteTable = async (tableId) => {
    try {
      await fetch(`${API_URL}/api/tables/${tableId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(tables.filter(t => t.id !== tableId));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  // Create wall
  const createWall = async (startX, startY, endX, endY) => {
    if (!activeZone) return;
    const wallConfig = wallTypes.find(w => w.id === wallType);
    try {
      const response = await fetch(`${API_URL}/api/floor-walls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zone_id: activeZone.id,
          restaurant_id: user.restaurant_id,
          wall_type: wallType,
          start_x: startX,
          start_y: startY,
          end_x: endX,
          end_y: endY,
          thickness: wallConfig?.thickness || 8,
          color: wallConfig?.color || '#1E2A4A'
        })
      });
      if (response.ok) {
        const result = await response.json();
        setWalls([...walls, {
          id: result.id,
          wall_type: wallType,
          start_x: startX,
          start_y: startY,
          end_x: endX,
          end_y: endY,
          thickness: wallConfig?.thickness || 8,
          color: wallConfig?.color || '#1E2A4A'
        }]);
      }
    } catch (error) {
      console.error('Error creating wall:', error);
    }
  };

  // Delete wall
  const deleteWall = async (wallId) => {
    try {
      await fetch(`${API_URL}/api/floor-walls/${wallId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalls(walls.filter(w => w.id !== wallId));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting wall:', error);
    }
  };

  // Create element
  const addElement = async (x, y) => {
    if (!activeZone) return;
    const elemConfig = elementTypes.find(e => e.id === elementType);
    try {
      const response = await fetch(`${API_URL}/api/floor-elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zone_id: activeZone.id,
          restaurant_id: user.restaurant_id,
          element_type: elementType,
          position_x: x,
          position_y: y,
          width: elemConfig?.defaultSize?.width || 60,
          height: elemConfig?.defaultSize?.height || 60,
          label: elemConfig?.label || ''
        })
      });
      if (response.ok) {
        const result = await response.json();
        setElements([...elements, {
          id: result.id,
          element_type: elementType,
          position_x: x,
          position_y: y,
          width: elemConfig?.defaultSize?.width || 60,
          height: elemConfig?.defaultSize?.height || 60,
          label: elemConfig?.label || ''
        }]);
      }
    } catch (error) {
      console.error('Error creating element:', error);
    }
  };

  // Delete element
  const deleteElement = async (elementId) => {
    try {
      await fetch(`${API_URL}/api/floor-elements/${elementId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setElements(elements.filter(e => e.id !== elementId));
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  // Show QR Code
  const showTableQR = async (table) => {
    try {
      const response = await fetch(`${API_URL}/api/tables/${table.id}/qrcode-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQrData({ ...data, table });
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Error fetching QR data:', error);
    }
  };

  // Canvas mouse handlers
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleCanvasMouseDown = (e) => {
    const coords = getCanvasCoords(e);
    
    if (tool === 'wall') {
      if (!isDrawingWall) {
        setIsDrawingWall(true);
        setWallStart(coords);
        setTempWallEnd(coords);
      } else {
        // Finish wall
        createWall(wallStart.x, wallStart.y, coords.x, coords.y);
        setIsDrawingWall(false);
        setWallStart(null);
        setTempWallEnd(null);
      }
      return;
    }
    
    if (tool === 'element') {
      addElement(coords.x, coords.y);
      setTool('select');
      return;
    }
    
    // Select tool - check if clicked on item
    // Check tables
    for (const table of tables) {
      const tx = table.position_x || 0;
      const ty = table.position_y || 0;
      const tw = table.width || 60;
      const th = table.height || 60;
      
      if (coords.x >= tx && coords.x <= tx + tw && coords.y >= ty && coords.y <= ty + th) {
        setSelectedItem({ type: 'table', id: table.id });
        setSelectedRoomItem(null);
        setIsDragging(true);
        setDragOffset({ x: coords.x - tx, y: coords.y - ty });
        return;
      }
    }
    
    // Check elements
    for (const elem of elements) {
      const ex = elem.position_x || 0;
      const ey = elem.position_y || 0;
      const ew = elem.width || 60;
      const eh = elem.height || 60;
      
      if (coords.x >= ex && coords.x <= ex + ew && coords.y >= ey && coords.y <= ey + eh) {
        setSelectedItem({ type: 'element', id: elem.id });
        setSelectedRoomItem(null);
        setIsDragging(true);
        setDragOffset({ x: coords.x - ex, y: coords.y - ey });
        return;
      }
    }
    
    // Check walls - with tolerance for clicking
    for (const wall of walls) {
      const tolerance = (wall.thickness || 8) / 2 + 5;
      if (isPointNearLine(coords.x, coords.y, wall.start_x, wall.start_y, wall.end_x, wall.end_y, tolerance)) {
        setSelectedItem({ type: 'wall', id: wall.id });
        setSelectedRoomItem(null);
        return;
      }
    }
    
    // Check rooms
    for (const room of rooms) {
      const rx = room.position_x || 0;
      const ry = room.position_y || 0;
      const rw = room.width || 200;
      const rh = room.height || 200;
      
      // Check resize handles first
      const handleSize = 12;
      const handles = [
        { name: 'nw', x: rx, y: ry },
        { name: 'ne', x: rx + rw, y: ry },
        { name: 'se', x: rx + rw, y: ry + rh },
        { name: 'sw', x: rx, y: ry + rh },
        { name: 'n', x: rx + rw/2, y: ry },
        { name: 's', x: rx + rw/2, y: ry + rh },
        { name: 'e', x: rx + rw, y: ry + rh/2 },
        { name: 'w', x: rx, y: ry + rh/2 },
      ];
      
      for (const handle of handles) {
        if (Math.abs(coords.x - handle.x) <= handleSize && Math.abs(coords.y - handle.y) <= handleSize) {
          setSelectedRoomItem(room.id);
          setSelectedItem(null);
          setIsResizing(true);
          setResizeHandle(handle.name);
          setResizeStart({ x: coords.x, y: coords.y, room: { ...room } });
          return;
        }
      }
      
      // Check if inside room
      if (coords.x >= rx && coords.x <= rx + rw && coords.y >= ry && coords.y <= ry + rh) {
        setSelectedRoomItem(room.id);
        setSelectedItem(null);
        setIsDragging(true);
        setDragOffset({ x: coords.x - rx, y: coords.y - ry });
        return;
      }
    }
    
    // Deselect
    setSelectedItem(null);
    setSelectedRoomItem(null);
  };

  // Helper function to check if point is near a line
  const isPointNearLine = (px, py, x1, y1, x2, y2, tolerance) => {
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (lineLength === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2) <= tolerance;
    
    const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength ** 2)));
    const closestX = x1 + t * (x2 - x1);
    const closestY = y1 + t * (y2 - y1);
    const distance = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
    
    return distance <= tolerance;
  };

  const handleCanvasMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    
    if (isDrawingWall && wallStart) {
      setTempWallEnd(coords);
      return;
    }
    
    // Handle room resizing
    if (isResizing && selectedRoomItem && resizeStart) {
      const room = resizeStart.room;
      const dx = coords.x - resizeStart.x;
      const dy = coords.y - resizeStart.y;
      
      let newX = room.position_x;
      let newY = room.position_y;
      let newW = room.width;
      let newH = room.height;
      
      switch (resizeHandle) {
        case 'nw':
          newX = room.position_x + dx;
          newY = room.position_y + dy;
          newW = room.width - dx;
          newH = room.height - dy;
          break;
        case 'ne':
          newY = room.position_y + dy;
          newW = room.width + dx;
          newH = room.height - dy;
          break;
        case 'se':
          newW = room.width + dx;
          newH = room.height + dy;
          break;
        case 'sw':
          newX = room.position_x + dx;
          newW = room.width - dx;
          newH = room.height + dy;
          break;
        case 'n':
          newY = room.position_y + dy;
          newH = room.height - dy;
          break;
        case 's':
          newH = room.height + dy;
          break;
        case 'e':
          newW = room.width + dx;
          break;
        case 'w':
          newX = room.position_x + dx;
          newW = room.width - dx;
          break;
        default:
          break;
      }
      
      // Minimum size
      if (newW < 50) { newW = 50; newX = room.position_x; }
      if (newH < 50) { newH = 50; newY = room.position_y; }
      
      setRooms(rooms.map(r =>
        r.id === selectedRoomItem
          ? { ...r, position_x: newX, position_y: newY, width: newW, height: newH }
          : r
      ));
      return;
    }
    
    if (isDragging && selectedRoomItem) {
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      setRooms(rooms.map(r =>
        r.id === selectedRoomItem
          ? { ...r, position_x: newX, position_y: newY }
          : r
      ));
      return;
    }
    
    if (isDragging && selectedItem) {
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      
      if (selectedItem.type === 'table') {
        setTables(tables.map(t => 
          t.id === selectedItem.id 
            ? { ...t, position_x: newX, position_y: newY }
            : t
        ));
      } else if (selectedItem.type === 'element') {
        setElements(elements.map(el => 
          el.id === selectedItem.id 
            ? { ...el, position_x: newX, position_y: newY }
            : el
        ));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isResizing && selectedRoomItem) {
      const room = rooms.find(r => r.id === selectedRoomItem);
      if (room) {
        updateRoom(room.id, {
          position_x: room.position_x,
          position_y: room.position_y,
          width: room.width,
          height: room.height
        });
      }
      setIsResizing(false);
      setResizeHandle(null);
      setResizeStart(null);
      return;
    }
    
    if (isDragging && selectedRoomItem) {
      const room = rooms.find(r => r.id === selectedRoomItem);
      if (room) {
        updateRoom(room.id, {
          position_x: room.position_x,
          position_y: room.position_y
        });
      }
    }
    
    if (isDragging && selectedItem) {
      // Save position
      if (selectedItem.type === 'table') {
        const table = tables.find(t => t.id === selectedItem.id);
        if (table) {
          updateTablePosition(table.id, table.position_x, table.position_y);
        }
      }
    }
    setIsDragging(false);
  };

  // Render table shape
  const renderTableShape = (table, isSelected) => {
    const x = table.position_x || 0;
    const y = table.position_y || 0;
    const w = table.width || 60;
    const h = table.height || 60;
    
    const baseStyle = {
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: tool === 'select' ? 'move' : 'default',
      border: isSelected ? `3px solid ${colors.accent}` : `2px solid ${colors.primary}`,
      backgroundColor: isSelected ? `${colors.accent}20` : colors.white,
      transition: 'border-color 0.2s, background-color 0.2s',
      fontSize: '14px',
      fontWeight: 'bold',
      color: colors.primary,
    };
    
    if (table.shape === 'round') {
      baseStyle.borderRadius = '50%';
    } else if (table.shape === 'rectangle') {
      baseStyle.borderRadius = '4px';
    } else {
      baseStyle.borderRadius = '8px';
    }
    
    return (
      <div 
        key={table.id}
        style={baseStyle}
        onClick={(e) => {
          e.stopPropagation();
          if (tool === 'select') {
            setSelectedItem({ type: 'table', id: table.id });
          }
        }}
        onDoubleClick={() => showTableQR(table)}
      >
        {table.table_number}
      </div>
    );
  };

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: colors.border }}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.dark }} />
              </button>
              <div>
                <h1 className="font-bold text-lg" style={{ color: colors.dark }}>{txt.title}</h1>
              </div>
            </div>
            
            {/* Zone Tabs */}
            <div className="flex items-center gap-2">
              {zones.map((zone) => (
                <div key={zone.id} className="relative flex items-center">
                  <div
                    onClick={() => setActiveZone(zone)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
                      activeZone?.id === zone.id ? 'text-white' : ''
                    }`}
                    style={{
                      backgroundColor: activeZone?.id === zone.id ? colors.primary : colors.light,
                      color: activeZone?.id === zone.id ? 'white' : colors.gray
                    }}
                  >
                    {zone.name}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoneMenuOpen(zoneMenuOpen === zone.id ? null : zone.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 transition-colors ml-1"
                    data-testid={`zone-menu-${zone.id}`}
                  >
                    <MoreVertical className="w-4 h-4" style={{ color: colors.gray }} />
                  </button>
                  
                  {/* Zone Menu Dropdown */}
                  {zoneMenuOpen === zone.id && (
                    <div 
                      className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 py-1 min-w-[140px]"
                      style={{ borderColor: colors.border }}
                    >
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-all text-sm"
                        data-testid={`delete-zone-${zone.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {txt.deleteZone}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowZoneModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={txt.addZone}
              >
                <Plus className="w-5 h-5" style={{ color: colors.gray }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Tools */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4" style={{ borderColor: colors.border }}>
          {/* Tools Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
              {txt.tools}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setTool('select')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  tool === 'select' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: tool === 'select' ? colors.primary : 'transparent',
                  color: tool === 'select' ? 'white' : colors.dark
                }}
              >
                <MousePointer className="w-5 h-5" />
                {txt.select}
              </button>
              <button
                onClick={() => setTool('wall')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  tool === 'wall' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: tool === 'wall' ? colors.primary : 'transparent',
                  color: tool === 'wall' ? 'white' : colors.dark
                }}
              >
                <PenTool className="w-5 h-5" />
                {txt.drawWall}
              </button>
              <button
                onClick={() => setTool('element')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  tool === 'element' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: tool === 'element' ? colors.primary : 'transparent',
                  color: tool === 'element' ? 'white' : colors.dark
                }}
              >
                <Grid3X3 className="w-5 h-5" />
                {txt.addElement}
              </button>
            </div>
          </div>

          {/* Wall Types */}
          {tool === 'wall' && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
                {txt.wallTypes}
              </h3>
              <div className="space-y-2">
                {wallTypes.map((wt) => (
                  <button
                    key={wt.id}
                    onClick={() => setWallType(wt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border ${
                      wallType === wt.id ? 'border-primary' : ''
                    }`}
                    style={{
                      borderColor: wallType === wt.id ? colors.primary : colors.border,
                      backgroundColor: wallType === wt.id ? `${colors.primary}10` : 'transparent'
                    }}
                  >
                    <div 
                      className="w-8 h-2 rounded"
                      style={{ backgroundColor: wt.color, height: wt.thickness }}
                    />
                    <span className="text-sm" style={{ color: colors.dark }}>{wt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: colors.gray }}>{txt.clickTwiceForWall}</p>
            </div>
          )}

          {/* Element Types */}
          {tool === 'element' && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
                {txt.elements}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {elementTypes.map((et) => (
                  <button
                    key={et.id}
                    onClick={() => setElementType(et.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all border ${
                      elementType === et.id ? 'border-primary' : ''
                    }`}
                    style={{
                      borderColor: elementType === et.id ? colors.primary : colors.border,
                      backgroundColor: elementType === et.id ? `${colors.primary}10` : 'transparent'
                    }}
                  >
                    <et.icon className="w-5 h-5" style={{ color: colors.dark }} />
                    <span className="text-xs" style={{ color: colors.gray }}>{et.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: colors.gray }}>{txt.clickToPlace}</p>
            </div>
          )}

          {/* Pre-made Rooms Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
              {txt.rooms}
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {roomShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedRoom(shape.id);
                    setRoomDimensions({ width: shape.defaultWidth, height: shape.defaultHeight });
                    setShowRoomModal(true);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all border hover:border-primary"
                  style={{ borderColor: colors.border }}
                  title={shape.label}
                >
                  <shape.icon className="w-5 h-5" style={{ color: colors.primary }} />
                  <span className="text-xs" style={{ color: colors.gray }}>{shape.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs" style={{ color: colors.gray }}>{txt.dragToResize}</p>
          </div>

          {/* Tables Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
              {txt.tables}
            </h3>
            
            {/* Table Shape Selector */}
            <div className="flex gap-2 mb-3">
              {tableShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => setTableShape(shape.id)}
                  className={`flex-1 p-2 rounded-lg border transition-all ${
                    tableShape === shape.id ? 'border-primary' : ''
                  }`}
                  style={{
                    borderColor: tableShape === shape.id ? colors.primary : colors.border,
                    backgroundColor: tableShape === shape.id ? `${colors.primary}10` : 'transparent'
                  }}
                  title={shape.label}
                >
                  <shape.icon className="w-5 h-5 mx-auto" style={{ color: colors.dark }} />
                </button>
              ))}
            </div>
            
            <button
              onClick={addTable}
              disabled={!activeZone}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.accent }}
            >
              <Plus className="w-4 h-4" />
              {txt.addTable}
            </button>
          </div>

          {/* Selected Item Actions */}
          {selectedItem && (
            <div className="border-t pt-4" style={{ borderColor: colors.border }} data-testid="selected-item-panel">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
                {selectedItem.type === 'table' ? txt.tableNumber : selectedItem.type === 'wall' ? 'Parede Selecionada' : 'Elemento'}
              </h3>
              
              {selectedItem.type === 'table' && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const table = tables.find(t => t.id === selectedItem.id);
                      if (table) showTableQR(table);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-gray-50"
                    style={{ borderColor: colors.border }}
                  >
                    <QrCode className="w-4 h-4" style={{ color: colors.primary }} />
                    <span className="text-sm">{txt.viewQR}</span>
                  </button>
                </div>
              )}
              
              <button
                onClick={() => {
                  if (selectedItem.type === 'table') {
                    deleteTable(selectedItem.id);
                  } else if (selectedItem.type === 'wall') {
                    deleteWall(selectedItem.id);
                  } else if (selectedItem.type === 'element') {
                    deleteElement(selectedItem.id);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all mt-2"
                data-testid="delete-selected-item"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">{txt.delete}</span>
              </button>
            </div>
          )}

          {/* Selected Room Actions */}
          {selectedRoomItem && (
            <div className="border-t pt-4" style={{ borderColor: colors.border }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray }}>
                Planta Selecionada
              </h3>
              
              {/* Show room dimensions */}
              {(() => {
                const room = rooms.find(r => r.id === selectedRoomItem);
                if (room) {
                  return (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4" style={{ color: colors.gray }} />
                        <span className="text-sm" style={{ color: colors.dark }}>
                          {Math.round(room.width)} x {Math.round(room.height)} cm
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <button
                onClick={() => deleteRoom(selectedRoomItem)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">{txt.delete}</span>
              </button>
            </div>
          )}
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 p-6 overflow-auto">
          {zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <Layers className="w-16 h-16 mb-4" style={{ color: colors.gray }} />
              <p className="text-lg mb-4" style={{ color: colors.gray }}>{txt.noZones}</p>
              <button
                onClick={createDefaultZones}
                className="px-6 py-3 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {txt.createDefaultZones}
              </button>
            </div>
          ) : (
            <div 
              ref={canvasRef}
              className="relative bg-white rounded-xl border shadow-sm overflow-hidden"
              style={{ 
                width: activeZone?.canvas_width || 1200, 
                height: activeZone?.canvas_height || 800,
                borderColor: colors.border,
                backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {/* Render Rooms (pre-made shapes) */}
              {rooms.map((room) => {
                const isSelected = selectedRoomItem === room.id;
                const rx = room.position_x || 0;
                const ry = room.position_y || 0;
                const rw = room.width || 200;
                const rh = room.height || 200;
                
                return (
                  <div
                    key={room.id}
                    className="absolute"
                    style={{
                      left: rx,
                      top: ry,
                      width: rw,
                      height: rh,
                      border: `3px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? colors.accent : colors.primary}`,
                      borderRadius: room.shape === 'round' ? '50%' : room.shape === 'rectangle' ? '4px' : '8px',
                      backgroundColor: isSelected ? `${colors.accent}10` : 'transparent',
                      cursor: tool === 'select' ? 'move' : 'default',
                    }}
                  >
                    {/* Resize Handles */}
                    {isSelected && (
                      <>
                        {/* Corner handles */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 rounded-full cursor-nw-resize" style={{ borderColor: colors.accent }} />
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 rounded-full cursor-ne-resize" style={{ borderColor: colors.accent }} />
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 rounded-full cursor-se-resize" style={{ borderColor: colors.accent }} />
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 rounded-full cursor-sw-resize" style={{ borderColor: colors.accent }} />
                        {/* Edge handles */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-n-resize" style={{ borderColor: colors.accent }} />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-s-resize" style={{ borderColor: colors.accent }} />
                        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-e-resize" style={{ borderColor: colors.accent }} />
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-w-resize" style={{ borderColor: colors.accent }} />
                      </>
                    )}
                    {/* Dimensions label */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 bg-white/80 rounded" style={{ color: colors.primary }}>
                      {Math.round(rw)} x {Math.round(rh)}
                    </div>
                  </div>
                );
              })}

              {/* Render Walls - now clickable */}
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                {walls.map((wall) => {
                  const isSelected = selectedItem?.type === 'wall' && selectedItem?.id === wall.id;
                  return (
                    <g key={wall.id}>
                      {/* Invisible wider line for easier clicking */}
                      <line
                        x1={wall.start_x}
                        y1={wall.start_y}
                        x2={wall.end_x}
                        y2={wall.end_y}
                        stroke="transparent"
                        strokeWidth={(wall.thickness || 8) + 10}
                        strokeLinecap="round"
                        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem({ type: 'wall', id: wall.id });
                          setSelectedRoomItem(null);
                        }}
                      />
                      {/* Visible line */}
                      <line
                        x1={wall.start_x}
                        y1={wall.start_y}
                        x2={wall.end_x}
                        y2={wall.end_y}
                        stroke={isSelected ? colors.accent : (wall.color || colors.primary)}
                        strokeWidth={wall.thickness || 8}
                        strokeLinecap="round"
                        style={{ pointerEvents: 'none' }}
                      />
                      {/* Selection indicator */}
                      {isSelected && (
                        <>
                          <circle cx={wall.start_x} cy={wall.start_y} r={6} fill={colors.accent} />
                          <circle cx={wall.end_x} cy={wall.end_y} r={6} fill={colors.accent} />
                        </>
                      )}
                    </g>
                  );
                })}
                {/* Temporary wall while drawing */}
                {isDrawingWall && wallStart && tempWallEnd && (
                  <line
                    x1={wallStart.x}
                    y1={wallStart.y}
                    x2={tempWallEnd.x}
                    y2={tempWallEnd.y}
                    stroke={wallTypes.find(w => w.id === wallType)?.color || colors.primary}
                    strokeWidth={wallTypes.find(w => w.id === wallType)?.thickness || 8}
                    strokeLinecap="round"
                    strokeDasharray="5,5"
                    opacity={0.6}
                  />
                )}
              </svg>

              {/* Render Elements */}
              {elements.map((elem) => {
                const ElemIcon = elementTypes.find(et => et.id === elem.element_type)?.icon || Square;
                const isSelected = selectedItem?.type === 'element' && selectedItem?.id === elem.id;
                return (
                  <div
                    key={elem.id}
                    className="absolute flex items-center justify-center rounded"
                    style={{
                      left: elem.position_x,
                      top: elem.position_y,
                      width: elem.width,
                      height: elem.height,
                      backgroundColor: elem.color || '#94A3B8',
                      border: isSelected ? `2px solid ${colors.accent}` : 'none',
                      cursor: tool === 'select' ? 'move' : 'default',
                      opacity: 0.8
                    }}
                  >
                    {elem.label && (
                      <span className="text-xs text-white font-medium">{elem.label}</span>
                    )}
                  </div>
                );
              })}

              {/* Render Tables */}
              {tables.map((table) => {
                const isSelected = selectedItem?.type === 'table' && selectedItem?.id === table.id;
                return renderTableShape(table, isSelected);
              })}
            </div>
          )}
        </main>
      </div>

      {/* Zone Modal */}
      <AnimatePresence>
        {showZoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowZoneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4" style={{ color: colors.dark }}>{txt.addZone}</h3>
              <input
                type="text"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder={txt.zoneName}
                className="w-full px-4 py-3 rounded-lg border mb-4"
                style={{ borderColor: colors.border }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowZoneModal(false)}
                  className="flex-1 py-2 rounded-lg border font-medium"
                  style={{ borderColor: colors.border, color: colors.gray }}
                >
                  {txt.cancel}
                </button>
                <button
                  onClick={createZone}
                  className="flex-1 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {txt.create}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Modal */}
      <AnimatePresence>
        {showRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoomModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4" style={{ color: colors.dark }}>{txt.addRoom}</h3>
              
              {/* Shape preview */}
              <div className="flex justify-center mb-4">
                {selectedRoom === 'round' ? (
                  <div 
                    className="w-20 h-20 border-2 rounded-full"
                    style={{ borderColor: colors.primary }}
                  />
                ) : selectedRoom === 'rectangle' ? (
                  <div 
                    className="w-28 h-16 border-2 rounded"
                    style={{ borderColor: colors.primary }}
                  />
                ) : (
                  <div 
                    className="w-20 h-20 border-2 rounded-lg"
                    style={{ borderColor: colors.primary }}
                  />
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                    {txt.roomWidth}
                  </label>
                  <input
                    type="number"
                    value={roomDimensions.width}
                    onChange={(e) => setRoomDimensions({ ...roomDimensions, width: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: colors.border }}
                    min={50}
                    max={1000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                    {txt.roomHeight}
                  </label>
                  <input
                    type="number"
                    value={roomDimensions.height}
                    onChange={(e) => setRoomDimensions({ ...roomDimensions, height: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: colors.border }}
                    min={50}
                    max={1000}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRoomModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 py-2 rounded-lg border font-medium"
                  style={{ borderColor: colors.border, color: colors.gray }}
                >
                  {txt.cancel}
                </button>
                <button
                  onClick={addRoom}
                  disabled={!activeZone}
                  className="flex-1 py-2 rounded-lg font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {txt.create}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal - Print Ready */}
      <AnimatePresence>
        {showQRModal && qrData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md z-10 print:hidden"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Print-ready QR Card */}
              <div id="qr-print-area" className="bg-gradient-to-br from-[#1a2342] to-[#2d3a5c] p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <img 
                    src="/logo.png" 
                    alt="ZentraQR" 
                    className="w-20 h-20 object-contain"
                  />
                </div>

                {/* QR Code Container */}
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-3 rounded-xl border-4 border-[#1a2342]/10">
                      <img 
                        src={`${API_URL}/api/tables/${qrData.table_id}/qrcode`} 
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Table Info */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Mesa</p>
                    <p className="text-4xl font-bold text-[#1a2342]">{qrData.table_number}</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 text-center">
                  <p className="text-white/90 text-sm font-medium mb-2">
                    📱 Leia o QR Code para fazer o pedido
                  </p>
                  <p className="text-white/60 text-xs">
                    Aponte a câmara do telemóvel para o código
                  </p>
                </div>
              </div>

              {/* Actions - Hidden when printing */}
              <div className="p-4 bg-gray-50 flex gap-3 print:hidden">
                <button
                  onClick={() => {
                    const printContent = document.getElementById('qr-print-area');
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>QR Code - Mesa ${qrData.table_number}</title>
                          <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
                            .card { max-width: 400px; }
                            @media print { body { background: white; } }
                          </style>
                        </head>
                        <body>
                          <div class="card">${printContent.innerHTML}</div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-[#1a2342] hover:bg-[#0f1529] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
                <a
                  href={`${API_URL}/api/tables/${qrData.table_id}/qrcode`}
                  download={`mesa-${qrData.table_number}-qrcode.png`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium border-2 border-[#1a2342] text-[#1a2342] hover:bg-[#1a2342] hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloorPlanPage;
