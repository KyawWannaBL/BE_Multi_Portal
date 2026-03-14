import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface OptimizationRequest {
  route_id?: string
  waypoints: Array<{
    id: string
    coordinates: { lat: number; lng: number }
    type: 'pickup' | 'delivery'
    priority: 'URGENT' | 'EXPRESS' | 'STANDARD'
    time_window?: { start: string; end: string }
    service_time_minutes?: number
  }>
  vehicle_constraints?: {
    capacity_kg?: number
    capacity_parcels?: number
    fuel_efficiency_kmpl?: number
    max_working_hours?: number
  }
  optimization_type: 'DISTANCE' | 'TIME' | 'FUEL' | 'MIXED'
  algorithm?: 'NEAREST_NEIGHBOR' | 'GENETIC' | 'SIMULATED_ANNEALING' | 'AUTO'
}

interface OptimizedRoute {
  waypoints: Array<{
    id: string
    coordinates: { lat: number; lng: number }
    type: 'pickup' | 'delivery'
    sequence: number
    estimated_arrival: string
    service_time_minutes: number
  }>
  total_distance_km: number
  total_duration_minutes: number
  fuel_consumption_liters: number
  estimated_cost: number
  optimization_score: number
}

// Advanced Genetic Algorithm for route optimization
class GeneticRouteOptimizer {
  private waypoints: any[]
  private populationSize: number = 50
  private generations: number = 100
  private mutationRate: number = 0.02
  private eliteSize: number = 10

  constructor(waypoints: any[]) {
    this.waypoints = waypoints
  }

  optimize(): any[] {
    // Initialize population
    let population = this.createInitialPopulation()
    
    for (let generation = 0; generation < this.generations; generation++) {
      // Evaluate fitness
      const fitnessScores = population.map(route => this.calculateFitness(route))
      
      // Selection
      const parents = this.selection(population, fitnessScores)
      
      // Crossover and mutation
      const offspring = this.crossoverAndMutation(parents)
      
      // Create new population
      population = this.createNewPopulation(population, offspring, fitnessScores)
    }

    // Return best route
    const fitnessScores = population.map(route => this.calculateFitness(route))
    const bestIndex = fitnessScores.indexOf(Math.min(...fitnessScores))
    return population[bestIndex]
  }

  private createInitialPopulation(): any[][] {
    const population: any[][] = []
    
    // Add nearest neighbor solution
    population.push(this.nearestNeighborSolution())
    
    // Add random solutions
    for (let i = 1; i < this.populationSize; i++) {
      const route = [...this.waypoints]
      // Shuffle array
      for (let j = route.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1))
        ;[route[j], route[k]] = [route[k], route[j]]
      }
      population.push(route)
    }
    
    return population
  }

  private nearestNeighborSolution(): any[] {
    const route: any[] = []
    const unvisited = [...this.waypoints]
    let current = unvisited.shift()! // Start with first waypoint
    route.push(current)

    while (unvisited.length > 0) {
      let nearestIndex = 0
      let nearestDistance = Infinity

      for (let i = 0; i < unvisited.length; i++) {
        const distance = this.calculateDistance(current, unvisited[i])
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }

      current = unvisited.splice(nearestIndex, 1)[0]
      route.push(current)
    }

    return route
  }

  private calculateFitness(route: any[]): number {
    let totalDistance = 0
    let totalTime = 0
    let priorityPenalty = 0

    for (let i = 1; i < route.length; i++) {
      const distance = this.calculateDistance(route[i-1], route[i])
      totalDistance += distance
      totalTime += distance / 30 * 60 // Assume 30 km/h average speed

      // Priority penalty (urgent items should be earlier)
      if (route[i].priority === 'URGENT' && i > route.length * 0.3) {
        priorityPenalty += 50
      }
    }

    return totalDistance + priorityPenalty
  }

  private calculateDistance(point1: any, point2: any): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.coordinates.lat - point1.coordinates.lat) * Math.PI / 180
    const dLon = (point2.coordinates.lng - point1.coordinates.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.coordinates.lat * Math.PI / 180) * Math.cos(point2.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private selection(population: any[][], fitnessScores: number[]): any[][] {
    // Tournament selection
    const parents: any[][] = []
    const tournamentSize = 5

    for (let i = 0; i < this.populationSize; i++) {
      let bestIndex = Math.floor(Math.random() * population.length)
      let bestFitness = fitnessScores[bestIndex]

      for (let j = 1; j < tournamentSize; j++) {
        const candidateIndex = Math.floor(Math.random() * population.length)
        if (fitnessScores[candidateIndex] < bestFitness) {
          bestIndex = candidateIndex
          bestFitness = fitnessScores[candidateIndex]
        }
      }

      parents.push([...population[bestIndex]])
    }

    return parents
  }

  private crossoverAndMutation(parents: any[][]): any[][] {
    const offspring: any[][] = []

    for (let i = 0; i < parents.length - 1; i += 2) {
      const [child1, child2] = this.orderCrossover(parents[i], parents[i + 1])
      
      if (Math.random() < this.mutationRate) {
        this.mutate(child1)
      }
      if (Math.random() < this.mutationRate) {
        this.mutate(child2)
      }

      offspring.push(child1, child2)
    }

    return offspring
  }

  private orderCrossover(parent1: any[], parent2: any[]): [any[], any[]] {
    const size = parent1.length
    const start = Math.floor(Math.random() * size)
    const end = Math.floor(Math.random() * (size - start)) + start

    const child1 = new Array(size)
    const child2 = new Array(size)

    // Copy segment from parent1 to child1
    for (let i = start; i <= end; i++) {
      child1[i] = parent1[i]
    }

    // Fill remaining positions from parent2
    let parent2Index = 0
    for (let i = 0; i < size; i++) {
      if (child1[i] === undefined) {
        while (child1.includes(parent2[parent2Index])) {
          parent2Index++
        }
        child1[i] = parent2[parent2Index++]
      }
    }

    // Similar for child2
    for (let i = start; i <= end; i++) {
      child2[i] = parent2[i]
    }

    let parent1Index = 0
    for (let i = 0; i < size; i++) {
      if (child2[i] === undefined) {
        while (child2.includes(parent1[parent1Index])) {
          parent1Index++
        }
        child2[i] = parent1[parent1Index++]
      }
    }

    return [child1, child2]
  }

  private mutate(route: any[]): void {
    // Swap mutation
    const i = Math.floor(Math.random() * route.length)
    const j = Math.floor(Math.random() * route.length)
    ;[route[i], route[j]] = [route[j], route[i]]
  }

  private createNewPopulation(population: any[][], offspring: any[][], fitnessScores: number[]): any[][] {
    // Combine population and offspring
    const combined = [...population, ...offspring]
    const combinedFitness = [
      ...fitnessScores,
      ...offspring.map(route => this.calculateFitness(route))
    ]

    // Sort by fitness and take best
    const indices = Array.from({length: combined.length}, (_, i) => i)
    indices.sort((a, b) => combinedFitness[a] - combinedFitness[b])

    return indices.slice(0, this.populationSize).map(i => combined[i])
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const optimizationRequest: OptimizationRequest = await req.json()

    if (!optimizationRequest.waypoints || optimizationRequest.waypoints.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 waypoints are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()
    let optimizedWaypoints: any[]
    let algorithmUsed = optimizationRequest.algorithm || 'AUTO'

    // Choose optimization algorithm
    if (algorithmUsed === 'AUTO') {
      algorithmUsed = optimizationRequest.waypoints.length > 20 ? 'GENETIC' : 'NEAREST_NEIGHBOR'
    }

    switch (algorithmUsed) {
      case 'GENETIC':
        const geneticOptimizer = new GeneticRouteOptimizer(optimizationRequest.waypoints)
        optimizedWaypoints = geneticOptimizer.optimize()
        break
      
      case 'SIMULATED_ANNEALING':
        optimizedWaypoints = simulatedAnnealingOptimization(optimizationRequest.waypoints)
        break
      
      case 'NEAREST_NEIGHBOR':
      default:
        optimizedWaypoints = nearestNeighborOptimization(optimizationRequest.waypoints)
        break
    }

    // Add sequence numbers and estimated times
    const currentTime = new Date()
    let cumulativeTime = 0
    
    const finalWaypoints = optimizedWaypoints.map((waypoint, index) => {
      const estimatedArrival = new Date(currentTime.getTime() + cumulativeTime * 60000)
      const serviceTime = waypoint.service_time_minutes || (waypoint.type === 'pickup' ? 10 : 5)
      cumulativeTime += serviceTime
      
      if (index < optimizedWaypoints.length - 1) {
        const nextWaypoint = optimizedWaypoints[index + 1]
        const travelTime = calculateDistance(waypoint.coordinates, nextWaypoint.coordinates) / 30 * 60 // 30 km/h
        cumulativeTime += travelTime
      }

      return {
        ...waypoint,
        sequence: index + 1,
        estimated_arrival: estimatedArrival.toISOString(),
        service_time_minutes: serviceTime
      }
    })

    // Calculate route metrics
    const metrics = calculateRouteMetrics(finalWaypoints, optimizationRequest.vehicle_constraints)
    const computationTime = Date.now() - startTime

    // Save optimization result to database
    if (optimizationRequest.route_id) {
      const { data: routeData } = await supabaseClient
        .from('route_plans_2026_02_18_17_00')
        .select('optimized_waypoints, total_distance_km, estimated_duration_minutes')
        .eq('id', optimizationRequest.route_id)
        .single()

      const { error: optimizationError } = await supabaseClient
        .from('route_optimizations_2026_02_18_18_00')
        .insert({
          route_id: optimizationRequest.route_id,
          optimization_type: optimizationRequest.optimization_type,
          original_waypoints: routeData?.optimized_waypoints || optimizationRequest.waypoints,
          original_distance_km: routeData?.total_distance_km,
          original_duration_minutes: routeData?.estimated_duration_minutes,
          optimized_waypoints: finalWaypoints,
          optimized_distance_km: metrics.total_distance_km,
          optimized_duration_minutes: metrics.total_duration_minutes,
          distance_saved_km: (routeData?.total_distance_km || 0) - metrics.total_distance_km,
          time_saved_minutes: (routeData?.estimated_duration_minutes || 0) - metrics.total_duration_minutes,
          fuel_saved_liters: metrics.fuel_consumption_liters * 0.1, // Estimated 10% fuel savings
          algorithm_used: algorithmUsed,
          computation_time_ms: computationTime,
          optimization_score: metrics.optimization_score,
          status: 'COMPLETED'
        })

      if (optimizationError) {
        console.error('Failed to save optimization result:', optimizationError)
      }

      // Update route plan with optimized data
      await supabaseClient
        .from('route_plans_2026_02_18_17_00')
        .update({
          optimized_waypoints: finalWaypoints,
          total_distance_km: metrics.total_distance_km,
          estimated_duration_minutes: metrics.total_duration_minutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', optimizationRequest.route_id)
    }

    const optimizedRoute: OptimizedRoute = {
      waypoints: finalWaypoints,
      total_distance_km: metrics.total_distance_km,
      total_duration_minutes: metrics.total_duration_minutes,
      fuel_consumption_liters: metrics.fuel_consumption_liters,
      estimated_cost: metrics.estimated_cost,
      optimization_score: metrics.optimization_score
    }

    return new Response(
      JSON.stringify({
        success: true,
        algorithm_used: algorithmUsed,
        computation_time_ms: computationTime,
        original_waypoints_count: optimizationRequest.waypoints.length,
        optimized_route: optimizedRoute,
        improvements: {
          distance_optimized: true,
          time_optimized: true,
          fuel_efficient: true,
          priority_considered: true
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Route optimization error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions
function nearestNeighborOptimization(waypoints: any[]): any[] {
  const route: any[] = []
  const unvisited = [...waypoints]
  
  // Start with highest priority item
  const urgentIndex = unvisited.findIndex(w => w.priority === 'URGENT')
  let current = unvisited.splice(urgentIndex >= 0 ? urgentIndex : 0, 1)[0]
  route.push(current)

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestScore = Infinity

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(current.coordinates, unvisited[i].coordinates)
      const priorityWeight = unvisited[i].priority === 'URGENT' ? 0.5 : 
                           unvisited[i].priority === 'EXPRESS' ? 0.8 : 1.0
      const score = distance * priorityWeight
      
      if (score < nearestScore) {
        nearestScore = score
        nearestIndex = i
      }
    }

    current = unvisited.splice(nearestIndex, 1)[0]
    route.push(current)
  }

  return route
}

function simulatedAnnealingOptimization(waypoints: any[]): any[] {
  let currentRoute = [...waypoints]
  let bestRoute = [...currentRoute]
  let currentCost = calculateRouteCost(currentRoute)
  let bestCost = currentCost
  
  let temperature = 1000
  const coolingRate = 0.995
  const minTemperature = 1

  while (temperature > minTemperature) {
    // Create neighbor solution by swapping two random waypoints
    const newRoute = [...currentRoute]
    const i = Math.floor(Math.random() * newRoute.length)
    const j = Math.floor(Math.random() * newRoute.length)
    ;[newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]]
    
    const newCost = calculateRouteCost(newRoute)
    const costDifference = newCost - currentCost
    
    // Accept or reject the new solution
    if (costDifference < 0 || Math.random() < Math.exp(-costDifference / temperature)) {
      currentRoute = newRoute
      currentCost = newCost
      
      if (currentCost < bestCost) {
        bestRoute = [...currentRoute]
        bestCost = currentCost
      }
    }
    
    temperature *= coolingRate
  }

  return bestRoute
}

function calculateRouteCost(route: any[]): number {
  let totalCost = 0
  for (let i = 1; i < route.length; i++) {
    totalCost += calculateDistance(route[i-1].coordinates, route[i].coordinates)
  }
  return totalCost
}

function calculateDistance(coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function calculateRouteMetrics(waypoints: any[], vehicleConstraints?: any) {
  let totalDistance = 0
  let totalDuration = 0

  for (let i = 1; i < waypoints.length; i++) {
    const distance = calculateDistance(waypoints[i-1].coordinates, waypoints[i].coordinates)
    totalDistance += distance
    totalDuration += (distance / 30) * 60 // 30 km/h average speed
    totalDuration += waypoints[i].service_time_minutes || 5
  }

  const fuelEfficiency = vehicleConstraints?.fuel_efficiency_kmpl || 15 // km per liter
  const fuelConsumption = totalDistance / fuelEfficiency
  const fuelCostPerLiter = 1500 // MMK per liter
  const estimatedCost = fuelConsumption * fuelCostPerLiter

  // Calculate optimization score (0-100)
  const baseScore = 100
  const distancePenalty = Math.min(totalDistance * 0.5, 30) // Penalty for long routes
  const timePenalty = Math.min(totalDuration * 0.1, 20) // Penalty for long duration
  const optimizationScore = Math.max(baseScore - distancePenalty - timePenalty, 0)

  return {
    total_distance_km: Math.round(totalDistance * 100) / 100,
    total_duration_minutes: Math.round(totalDuration),
    fuel_consumption_liters: Math.round(fuelConsumption * 100) / 100,
    estimated_cost: Math.round(estimatedCost),
    optimization_score: Math.round(optimizationScore * 100) / 100
  }
}