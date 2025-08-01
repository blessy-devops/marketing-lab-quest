import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowUpDown, Calendar, Eye, MoreHorizontal, Plus, Search, Edit2, Trash2, Filter, Grid, List, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useExperimentos } from '@/hooks/useSupabaseData';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CANAIS, CANAIS_OPTIONS, getChannelsByCategory, getChannelIcon } from "@/constants/canais";

interface ExperimentoExtended {
  id: string;
  nome: string;
  tipo?: string;
  status?: string;
  responsavel?: string;
  data_inicio?: string;
  data_fim?: string;
  canais?: string[];
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'concluido':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'em_andamento':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'planejado':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pausado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type?: string) => {
  switch (type) {
    case 'A/B Test':
      return 'bg-blue-100 text-blue-800';
    case 'Multivariate':
      return 'bg-purple-100 text-purple-800';
    case 'Landing Page':
      return 'bg-green-100 text-green-800';
    case 'Email':
      return 'bg-orange-100 text-orange-800';
    case 'Social Media':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


const TYPES = [
  'A/B Test',
  'Multivariate',
  'Landing Page',
  'Email',
  'Social Media'
];

const STATUS_OPTIONS = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'concluido', label: 'Concluído' }
];

const ITEMS_PER_PAGE = 20;

export default function ExperimentsList() {
  const navigate = useNavigate();
  const { experimentos, loading: isLoading } = useExperimentos();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter experiments
  const filteredExperiments = (experimentos || []).filter((exp: ExperimentoExtended) => {
    const matchesSearch = exp.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || (exp.tipo && selectedTypes.includes(exp.tipo));
    const matchesStatus = !selectedStatus || exp.status === selectedStatus;
    const matchesChannel = selectedChannels.length === 0 || 
      (exp.canais && exp.canais.some(canal => selectedChannels.includes(canal)));
    
    let matchesDate = true;
    if (startDate && exp.data_inicio) {
      matchesDate = matchesDate && new Date(exp.data_inicio) >= new Date(startDate);
    }
    if (endDate && exp.data_fim) {
      matchesDate = matchesDate && new Date(exp.data_fim) <= new Date(endDate);
    }

    return matchesSearch && matchesType && matchesStatus && matchesChannel && matchesDate;
  });

  // Sort experiments
  const sortedExperiments = [...filteredExperiments].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField as keyof ExperimentoExtended] || '';
    const bValue = b[sortField as keyof ExperimentoExtended] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedExperiments.length / ITEMS_PER_PAGE);
  const paginatedExperiments = sortedExperiments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedStatus('');
    setSelectedChannels([]);
    setStartDate('');
    setEndDate('');
    setSortField('');
    setCurrentPage(1);
  };

  const handleChannelChange = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experimentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus experimentos de marketing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros para encontrar experimentos específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <div className="space-y-2">
                {TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value === "todos" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Canal</label>
              <div className="space-y-2">
                {Object.entries(getChannelsByCategory()).map(([categoria, canais]) => (
                  <div key={categoria} className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">{categoria}</h4>
                    <div className="space-y-1 pl-2">
                      {canais.map((canal) => (
                        <div key={canal.value} className="flex items-center space-x-2">
                          <canal.icon className="w-3 h-3 text-muted-foreground" />
                          <Checkbox
                            id={canal.value}
                            checked={selectedChannels.includes(canal.value)}
                            onCheckedChange={() => handleChannelChange(canal.value)}
                          />
                          <Label htmlFor={canal.value} className="text-xs font-normal cursor-pointer">
                            {canal.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Experimentos ({filteredExperiments.length})</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} ({sortedExperiments.length} experimentos encontrados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('nome')}>
                      Nome
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('tipo')}>
                      Tipo
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('status')}>
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('responsavel')}>
                      Responsável
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('data_inicio')}>
                      Período
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExperiments.map((exp: ExperimentoExtended) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <Link
                        to={`/experimentos/${exp.id}`}
                        className="font-medium hover:underline"
                      >
                        {exp.nome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(exp.tipo)}>
                        {exp.tipo || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(exp.status)}>
                        {exp.status === 'planejado' ? 'Planejado' :
                         exp.status === 'em_andamento' ? 'Em Andamento' :
                         exp.status === 'pausado' ? 'Pausado' :
                         exp.status === 'concluido' ? 'Concluído' : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{exp.responsavel || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(exp.data_inicio)}</div>
                        <div className="text-muted-foreground">{formatDate(exp.data_fim)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/experimentos/${exp.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedExperiments.map((exp: ExperimentoExtended) => (
                <Card key={exp.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        <Link
                          to={`/experimentos/${exp.id}`}
                          className="hover:underline"
                        >
                          {exp.nome}
                        </Link>
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/experimentos/${exp.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Badge className={getTypeColor(exp.tipo)}>
                          {exp.tipo || 'N/A'}
                        </Badge>
                        <Badge className={getStatusColor(exp.status)}>
                          {exp.status === 'planejado' ? 'Planejado' :
                           exp.status === 'em_andamento' ? 'Em Andamento' :
                           exp.status === 'pausado' ? 'Pausado' :
                           exp.status === 'concluido' ? 'Concluído' : 'N/A'}
                        </Badge>
                      </div>
                      {exp.responsavel && (
                        <p className="text-sm text-muted-foreground">
                          Responsável: {exp.responsavel}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <div>Início: {formatDate(exp.data_inicio)}</div>
                        <div>Fim: {formatDate(exp.data_fim)}</div>
                      </div>
                      {exp.canais && exp.canais.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {exp.canais.slice(0, 3).map((canal, index) => (
                            <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                              {getChannelIcon(canal)}
                              {canal}
                            </Badge>
                          ))}
                          {exp.canais.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{exp.canais.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => navigate('/experimentos/novo')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}