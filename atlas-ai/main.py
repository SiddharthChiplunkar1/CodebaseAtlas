import grpc
from concurrent import futures
import logging
import sys
import os

# Add proto to Python path so generated imports work correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'proto')))

from proto import atlas_pb2_grpc
from app.grpc_server.servicers import AstParserServicer, EmbeddingServicer, LlmQueryServicer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Attach our Services to the gRPC server
    atlas_pb2_grpc.add_AstParserServiceServicer_to_server(AstParserServicer(), server)
    atlas_pb2_grpc.add_EmbeddingServiceServicer_to_server(EmbeddingServicer(), server)
    atlas_pb2_grpc.add_LlmQueryServiceServicer_to_server(LlmQueryServicer(), server)
    
    port = 50051
    server.add_insecure_port(f'[::]:{port}')
    
    logger.info(f"Starting Atlas AI gRPC server on port {port}...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
