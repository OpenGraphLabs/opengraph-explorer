module tensorflowsui::graph {
    use tensorflowsui::layer;

    public struct Graph has drop, store {
        layers: vector<layer::Layer>,
    }

    public fun new_graph(): Graph {
        Graph { layers: vector::empty<layer::Layer>() }
    }

    public fun get_layer_at(graph: &Graph, idx: u64): &layer::Layer {
        vector::borrow(&graph.layers, idx)
    }

    public fun get_layer_at_mut(graph: &mut Graph, idx: u64): &mut layer::Layer {
        vector::borrow_mut(&mut graph.layers, idx)
    }

    public fun get_layer_count(graph: &Graph): u64 {
        vector::length(&graph.layers)
    }

    public fun add_layer(graph: &mut Graph, layer: layer::Layer) {
        vector::push_back(&mut graph.layers, layer);
    } 
}
